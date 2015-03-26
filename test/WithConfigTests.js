var assert = require('assert')
var expressMock = require('../src/ExpressMock').ExpressMock;
var http = require('./httpHelper');

describe('ExpressMock', function(){
  var server = new expressMock({
    'port': http.port,
    'configFilePath': 'test/resources/BasicConfig.json'
  });

  before(function(done) {
    server.start(done);
  });

  after(function(done) {
    http.terminate();
    server.stop(done);
  });

  describe('With BasicConfig', function(){

    function assertDefaultResponse(res) {
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.code, 'NO_SUCH_ENDPOINT');
    }

    it('calling GET on unknown endpoint => 404', function(done){
      http.get('/unknown', function(res) {
        assertDefaultResponse(res);
        done();
      });
    });

    it('calling GET on /templates should return 2 templates', function(done){
      http.get('/templates', function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.length, 2);
        assert.equal(res.body[0].id, '1');
        assert.equal(res.body[1].id, '2');
        done();
      });
    });

    it('calling GET on /templates/2 should return template with id 2', function(done){
      http.get('/templates/2', function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.id, '2');
        assert.equal(res.body.name, 'ORDER CANCELLATION');
        done();
      });
    });

  });
});
