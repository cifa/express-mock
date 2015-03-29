(function() {
  var fs = require('fs'),
    util =  require('util'),
    store = require('./Store'),
    responses = require('./Responses'),
    paths = [];

  exports.loadConfig = function(filepath) {
    if (filepath) {
      var path = require('path');
      var root = path.resolve(__dirname, '../..');
      var config = JSON.parse(fs.readFileSync(path.join(root, filepath), 'utf8'));
      if (config.paths) {
        config.paths.forEach(addPath)
      }
      if (config.fixtures) {
        store.setFixtures(config.fixtures)
        store.resetFixtures();
      }
    }
  };

  exports.reset = function(req, res, next) {
    res.set('Content-Type', 'application/json');
    if (req.url === '/reset') {
      store.resetFixtures();
      res.status(200);
  		res.end();
    } else {
      next();
    }
  };

  exports.schedule = function(req, res, next) {
    next();
  };

  exports.process = function(req, res) {
    var matches, method;
    if (req.method !== 'OPTIONS'
        && (matches = findMatches(req.url)).length > 0) {
      method = req.method.toLowerCase();
      matches[0].body = req.body;
      store[method](matches[0], function(result) {
        responses.reply(result, req, res);
      });
    } else {
      responses.default(req, res);
    }
  };

  function addPath(path) {
    var regex = /{{(.*?)}}/g;
    var params = [];
    var match;
    while ((match = regex.exec(path)) !== null) {
      params.push(match[1]);
    }
    paths.push({
      path: path,
      regex: new RegExp('^' + path.replace(regex, '([^/]*)') + '$', 'i'),
      params: params
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
          paramValues: match.slice(1, p.params.length + 1)
        })
      }
    });
    return matches;
  };
})();
