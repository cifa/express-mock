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

  exports.get = function(query, done) {
    var segments = getSegments(query.path);
    query.body = find(currentFixtures, segments, query.paramNames, query.paramValues);
    query.body ? query.status = 200 : query.status = 404;
    done(query);
  };

  exports.delete = function(query, done) {
    del(query) ? query.status = 204 : query.status = 404;
    done(query);
  };

  function del (query) {
    var parent, segments, lastSegment, isLastSegParam, i, deleted = false;
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
        deleted = true;
      }
    } else if (parent && parent[lastSegment]) {
      parent[lastSegment] = [];
      deleted = true;
    }
    return deleted;
  };

  exports.put = function(query, done) {
    var result, segments, lastParamName, lastParamValue, parent, i;
    segments = getSegments(query.path);
    query.status = 400;

    if (util.isArray(query.body)) {
      if (replaceCollection(query, query.body)) {
        query.status = 200;
      } else {
        query.msg = 'Single object expected but found collection';
      }
    } else if(query.body) {
      lastParamName = query.paramNames[query.paramNames.length - 1];
      lastParamValue = query.paramValues[query.paramValues.length - 1]
      query.body[lastParamName] = lastParamValue;
      parent = findParent(segments, query.paramNames, query.paramValues);
      if (util.isArray(parent)) {
        i = findIndexOf(parent, lastParamName, lastParamValue);
        if (i === -1) {
          parent.push(query.body);
          query.status = 201;
        } else {
          parent.splice(i, 1, query.body);
          query.status = 200;
        }
      } else {
        query.msg = 'Collection expected but found a single object';
      }
    } else {
      query.msg = 'No payload sent';
    }
    done(query);
  };

  function replaceCollection(query, replacement) {
    var done = false;
    var segments = getSegments(query.path);
    var current = find(currentFixtures, segments, query.paramNames, query.paramValues);
    if (util.isArray(current)) {
      current.splice(0, current.length);
      Array.prototype.push.apply(current, replacement);
      done = true;
    }
    return done;
  }

  exports.post = function(query, done) {
    query.status = 500;
    done(query);
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

})();
