var express = require('express')
  , http = require('http')
  , util = require('util')
  , bodyParser = require('body-parser');

var ExpressMock = (function () {
  function ExpressMock(config) {
    this.service = require('./middleware/Service')
    if (config == undefined) {
      config = {};
    }
    this.port = config.port || 3000;
    this.service.loadConfig(config.configFilePath);
    this.app = express();

    this.app.use(bodyParser.json({strict: false}));
    this.app.use(this.service.processOptions);
    this.app.use(this.service.reset);
    this.app.use(this.service.schedule);
    this.app.use(this.service.processPost);
    this.app.use(this.service.processOther);
  };

  function invokeCallback(callback) {
    if (typeof callback === 'function') {
      callback();
    }
  }

  ExpressMock.prototype.start = function(callback) {
    var port = this.port;
    if (this.server === undefined) {
      this.server = http.createServer(this.app).listen(port, function(){
        util.log(util.format("ExpressMock server has started on port %d", port));
        invokeCallback(callback);
      });

      this.server.on('close', function() {
        util.log(util.format("ExpressMock server running on port %d has stopped", port));
      });
    }
  };

  ExpressMock.prototype.stop = function(callback) {
    if (this.server) {
      this.server.close(function() {
        invokeCallback(callback);
      });
      this.server = undefined;
    } else {
      util.log("Nothing to stop - server not running")
    }
  }

  return ExpressMock;
})();

exports.ExpressMock = ExpressMock;
