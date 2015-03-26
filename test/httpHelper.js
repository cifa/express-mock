var http = require('http');

(function() {
  var port = 4000;
  var host = 'localhost';
  var url = 'http://' + host + ':' + port;
  var opts = {
     port: port,
     headers: {'content-type':'application/json'}
  };

  function extractPayload(res, callback) {
    var data = "";
    res.setEncoding('utf8');

    res.on('data', function(d) {
      data += d;
    });

    res.on('end', function() {
      res.body = {};
      if (data.length > 0) {
        res.body = JSON.parse(data);
      }
      callback(res);
    });
  }

  exports.port = port;

  exports.terminate = function() {
    if (http.globalAgent.sockets[host + ':' + port]) {
      http.globalAgent.sockets[host + ':' + port].forEach(function(socket) {
        socket.end();
      });
    };
  };

  exports.get = function(path, callback) {
    http.get(url + path, function(res) {
      extractPayload(res, callback);
    });
  };

  exports.post = function(payload, path, callback) {
    var reqOptions = JSON.parse(JSON.stringify(opts));
    reqOptions.method = 'POST';
    reqOptions.path = path;
    var req = http.request(reqOptions, function(res) {
      extractPayload(res, callback);
    });
    req.write(JSON.stringify(payload));
    req.end();
  };

  exports.put = function(payload, path, callback) {
    var reqOptions = JSON.parse(JSON.stringify(opts));
    reqOptions.method = 'PUT';
    reqOptions.path = path;
    var req = http.request(reqOptions, function(res) {
      extractPayload(res, callback);
    });
    req.write(JSON.stringify(payload));
    req.end();
  };

  exports.delete = function(path, callback) {
    var reqOptions = JSON.parse(JSON.stringify(opts));
    reqOptions.method = 'DELETE';
    reqOptions.path = path;
    http.request(reqOptions, function(res) {
      extractPayload(res, callback);
    }).end();
  };

  exports.options = function(path, callback) {
    var reqOptions = JSON.parse(JSON.stringify(opts));
    reqOptions.method = 'OPTIONS';
    reqOptions.path = path;
    http.request(reqOptions, function(res) {
      extractPayload(res, callback);
    }).end();
  };
})();
