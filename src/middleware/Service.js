(function() {
  var fs = require('fs'),
    util =  require('util'),
    store = require('./Store')
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

  exports.process = function(req, res, next) {
    var matches, method, result;
    matches = findMatches(req.url);
    if (matches.length > 0) {
      method = req.method.toLowerCase();
      store[method](matches[0], req, res, next);
    } else {
      next();
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
  }

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
    })
    return matches;
  };
})();
