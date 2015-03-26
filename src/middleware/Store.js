(function() {
  var configuredFixtures = {},
      currentFixtures = {};

  exports.setFixtures = function(fixtures) {
    configuredFixtures = fixtures;
  };

  exports.resetFixtures = function() {
    currentFixtures = JSON.parse(JSON.stringify(configuredFixtures));
  }

  exports.get = function(query, req, res) {
    var temp, result, paramIndex, segments, i;
    result = currentFixtures;
    paramIndex = 0;
    segments = query.path.split('/').slice(1);

    for (i = 0; i < segments.length; i++) {
      if (segments[i].indexOf('{{') === -1) {
        result = result[segments[i]];
      } else {
        temp = undefined;
        result.forEach(function(f) {
          if (f[query.paramNames[paramIndex]] === query.paramValues[paramIndex]) {
            temp = f;
          }
        })
        result = temp;
        paramIndex++
      }
      if (result === undefined) {
        res.status(404).send(JSON.stringify({
          'httpStatus': 404,
          'code': 'NOT_FOUND_IN_STORE',
          'message': req.header('host') + req.url + ' not found in store'
        }));
      }
    }
    res.status(200).send(JSON.stringify(result));
  }
})();
