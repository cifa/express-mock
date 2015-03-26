(function() {
  var fs = require('fs'),
    util =  require('util'),
    config = {},
    processor = {
      paramRegex: /{{(.*?)}}/g,
      get: function(url, req, res, next) {
        var segments = url.split('/');
        var result;
        var fixtures = config.fixtures[segments[1]];
        if (segments[2]) {
          var field = paramRegex.exec(segments[2])[0];
          var value = paramRegex.exec(req.url)[0];
          fixtures.forEach(function(fixture) {
            if (fixture[field] === value) {
              result = fixture;
            }
          })
        } else {
          result = fixtures;
        }
        res.status(200).send(JSON.stringify(fixtures));
      }
    }

  exports.loadConfig = function(filepath) {
    if (filepath) {
      var path = require('path');
      var root = path.resolve(__dirname, '../..');
      config = JSON.parse(fs.readFileSync(path.join(root, filepath), 'utf8'));
    }
  };

  exports.reset = function(req, res, next) {
    res.set('Content-Type', 'application/json');
    if (req.url === '/reset') {
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
    var matches = findMatches(req.url);
    if (matches.length > 0) {
      var method = req.method.toLowerCase();
      processor[method](matches[0], req, res, next);
    } else {
      next();
    }
  };

  function findMatches(url) {
    var matches = [];

    if (config.paths && util.isArray(config.paths)) {
      config.paths.forEach(function(path) {
        if (url === path) {
          matches.push(path);
        }
      });
    }
    return matches;
  };
})();
