var http = require('http');
var expressMock = require('../src/ExpressMock').ExpressMock;

var port = 4000;
var url = "http://localhost:" + port;
var server = new expressMock(port);

server.start(function () {
  http.get(url, function(res) {
  	console.log(res.statusCode);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

setTimeout(function() {
  server.stop();
}, 5000);
