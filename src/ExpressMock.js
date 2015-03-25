var express = require('express')
  , http = require('http')
  , util = require('util');

var ExpressMock = (function () {
  function ExpressMock(port) {
    this.port = port || 3000;
    this.app = express();
  };

  ExpressMock.prototype.start = function(callback) {
    var port = this.port;
    if (this.server === undefined) {
      this.server = http.createServer(this.app).listen(port, function(){
        util.log(util.format("ExpressMock server has started on port %d", port));
        if (typeof callback === 'function') callback();
      });

      this.server.on('close', function() {
        util.log(util.format("ExpressMock server running on port %d has stopped", port));
      })
    }
  };

  ExpressMock.prototype.stop = function() {
    if (this.server) {
      this.server.close();
      this.server = undefined;
    } else {
      util.log("Nothing to stop - server not running")
    }
  }

  return ExpressMock;
})();

exports.ExpressMock = ExpressMock;
