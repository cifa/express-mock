(function() {
  var configuredFixtures = {},
      currentFixtures = {},
      util = require('util');

  exports.setFixtures = function(fixtures) {
    configuredFixtures = fixtures;
  };

  exports.resetFixtures = function() {
    currentFixtures = JSON.parse(JSON.stringify(configuredFixtures));
  };

  exports.get = function(query, req, res) {
    var result, segments;
    segments = getSegments(query.path);
    result = find(currentFixtures, segments, query.paramNames, query.paramValues);
    if (result) {
      res.status(200).send(JSON.stringify(result));
    } else {
      reply404(req, res);
    }
  };

  exports.delete = function(query, req, res) {
    var parent, segments, lastSegment, isLastSegParam, i;
    segments = getSegments(query.path);
    lastSegment = segments[segments.length - 1];
    isLastSegParam = lastSegment.indexOf('{{') === 0;
    parent = findParent(segments, query.paramNames, query.paramValues);

    if (util.isArray(parent) && isLastSegParam) {
      i = findIndexOf(parent,
        query.paramNames[query.paramNames.length - 1],
        query.paramValues[query.paramValues.length - 1]);
      if (i > -1) {
        parent.splice(i, 1);
        reply204(req, res);
      } else {
        reply404(req, res);
      }
    } else if (parent && parent[lastSegment]) {
      parent[lastSegment] = [];
      reply204(req, res);
    } else {
      reply404(req, res);
    }
  };

  exports.put = function(query, req, res) {
    reply404(req, res);
  };

  exports.post = function(query, req, res) {
    reply404(req, res);
  };

  function findParent(segments, params, values) {
    return find(
      currentFixtures,
      segments.slice(0, segments.length - 1),
      params, values
    );
  }

  function find(fixtures, segments, params, values) {
    var segment;
    if (!fixtures || segments.length == 0) {
      return fixtures;
    } else {
      segment = segments[0];
      if (segment.indexOf('{{') === -1) {
        return find(fixtures[segment], segments.slice(1), params, values);
      } else {
        return find(findInArray(fixtures, params[0], values[0]), segments.slice(1), params.slice(1), values.slice(1));
      }
    }
  }

  function findInArray(collection, fieldName, fieldValue) {
    var i, result;
    i = findIndexOf(collection, fieldName, fieldValue);
    if (i > -1) {
      result = collection[i];
    }
    return result;
  };

  function findIndexOf(collection, fieldName, fieldValue) {
    if (util.isArray(collection) && fieldName && fieldValue) {
      for (var i = 0; i < collection.length; i++) {
        if (collection[i][fieldName] === fieldValue) {
          return i;
        }
      }
    }
    return -1;
  };

  function getSegments(url) {
    return url.split('/').slice(1);
  };

  function reply204(req, res) {
    res.status(204).send();
  };

  function reply404(req, res) {
    res.status(404).send(JSON.stringify({
      'httpStatus': 404,
      'code': 'NOT_FOUND_IN_STORE',
      'message': req.header('host') + req.url + ' not found in store'
    }));
  };
})();
