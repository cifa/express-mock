(function() {
  var fs = require('fs'),
    util =  require('util'),
    store = require('./Store'),
    responses = require('./Responses'),
    generators = require('./Generators'),
    paths = [],
    scheduler = {},
    rules = {};

  exports.loadConfig = function(filepath) {
    if (filepath) {
      var config = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      if (config.paths) {
        config.paths.forEach(addPath)
      }
      if (config.fixtures) {
        store.setFixtures(config.fixtures)
        store.resetFixtures();
      }
    }
  };

  exports.loadRules = function(rulesPlugin) {
    if (rulesPlugin) {
      rules = require('./../plugins/' + rulesPlugin);
    }
  }

  exports.reset = function(req, res, next) {
    if (req.url === '/__reset__') {
      store.resetFixtures();
      scheduler = {};
      responses.reply({
        status: 200
      }, req, res);
    } else {
      next();
    }
  };

  exports.schedule = function(req, res, next) {
    var scheduledResponse;
    if (req.url === '/__schedule__') {
      req.body = req.body || {};
      initDefaults(req.body);
      scheduler[req.body.path] = req.body;
      responses.reply({
        status: 200
      }, req, res);
    } else if (scheduler[req.url] && scheduler[req.url].method === req.method) {
        scheduledResponse = scheduler[req.url];
        delete scheduler[req.url];
        res.set(scheduledResponse.headers);
        res.set('Content-Type', 'application/json');
        res.set('Access-Control-Allow-Origin', '*');
        res.status(scheduledResponse.status);
        res.end(JSON.stringify(scheduledResponse.body));
    } else {
      next();
    }
  };

  exports.processOptions = function(req, res, next) {
    if (req.method === 'OPTIONS') {
      responses.sendCORSHeaders(req, res);
    } else {
      next();
    }
  };

  exports.processPost = function(req, res, next) {
    var matches, query;
    if (req.method === 'POST' ) {
      matches = findMatches(req.url + '/__dummy__');
      if (matches.length > 0) {
        applyRules('post', req.url, req);
        query = matches[0];
        query.body = req.body;
        assignUniqueId(query);
        req.url = req.url + '/' + query.paramValues[query.paramValues.length - 1];
        store.put(query, function(result) {
          applyRules('return', req.url, result);
          responses.reply(result, req, res);
        });
      } else {
        if (findMatches(req.url).length > 0) {
          responses.reply({
            status: 400,
            msg: 'POST only available on collection endpoints'
          }, req, res);
        } else {
          responses.default(req, res);
        }
      }
    } else {
      next();
    }
  };

  function assignUniqueId(query) {
    var type, id;
    type = query.paramTypes[query.paramTypes.length - 1];
    id = generators[type](store.findExitingIds(query));
    query.paramValues.splice(-1, 1, id);
  };

  exports.processOther = function(req, res) {
    var matches, method;
    matches = findMatches(req.url);
    if (matches.length > 0) {
      method = req.method.toLowerCase();
      applyRules(method, req.url, req);
      matches[0].body = req.body;
      store[method](matches[0], function(result) {
        applyRules('return', req.url, result);
        responses.reply(result, req, res);
      });
    } else {
      responses.default(req, res);
    }
  };

  function addPath(path) {
    var regex, params, paramTypes, match, nameToType;
    regex = /{{(.*?)}}/g;
    params = [];
    paramTypes = [];
    match;
    while ((match = regex.exec(path)) !== null) {
      nameToType = match[1].split(':');
      params.push(nameToType[0]);
      paramTypes.push(nameToType[1]);
    }
    paths.push({
      path: path,
      regex: new RegExp('^' + path.replace(regex, '([^/]*)') + '$', 'i'),
      params: params,
      types: paramTypes
    });
  };

  function findMatches(url) {
    var matches = [];
    paths.forEach(function(p) {
      var match = p.regex.exec(url);
      if (match) {
        matches.push({
          path: p.path,
          paramNames: p.params,
          paramTypes: p.types,
          paramValues: match.slice(1, p.params.length + 1)
        })
      }
    });
    return matches;
  };

  function initDefaults(response) {
    response.path = response.path || '/';
    response.method = response.method || 'GET';
    response.status = response.status || 500;
    response.headers = response.headers || {};
  };

  function applyRules(type, url, container) {
    var lastSegment, segments;  
    if (container.body) {
      segments = findMatches(url)[0].path.split('/');
      do {
        lastSegment = segments.pop();
      } while (lastSegment.indexOf('{{') > -1);
      if (rules[type + '_' + lastSegment]) {
        container.body = rules[type + '_' + lastSegment](container.body);
      }
    }
  }
})();
