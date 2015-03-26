var assert = require('assert')
var expressMock = require('../src/ExpressMock').ExpressMock;
var http = require('./httpHelper');

describe('ExpressMock', function(){
  var server = new expressMock({
    'port': http.port
  });

  before(function(done) {
    server.start(done);
  });

  after(function(done) {
    http.terminate();
    server.stop(done);
  });

  describe('Without Configuration', function(){

    function assertDefaultResponse(res) {
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.code, 'NO_SUCH_ENDPOINT');
    }

    it('calling GET on unknown endpoint => 404', function(done){
      http.get('/', function(res) {
        assertDefaultResponse(res);
        done();
      });
    });

    it('calling POST on unknown endpoint => 404', function(done){
      http.post({'test': 123}, '/', function(res) {
        assertDefaultResponse(res);
        done();
      })
    });


    it('calling PUT on unknown endpoint => 404', function(done){
      http.put({'test': 123}, '/dummy', function(res) {
        assertDefaultResponse(res);
        done();
      });
    });

    it('calling DELETE on unknown endpoint => 404', function(done){
      http.delete('/dummy/123', function(res) {
        assertDefaultResponse(res);
        done();
      });
    });

    it('calling OPTIONS on any endpoint should allow CORS', function(done){
      http.options('/dummy/123', function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['access-control-allow-origin'], '*');
        assert.equal(res.headers['access-control-allow-credentials'], 'true');
        assert.equal(res.headers['access-control-allow-headers'], 'origin, content-type, accept, authorization, Access-Control-Allow-Origin');
        assert.equal(res.headers['access-control-allow-methods'], 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
        done();
      });
    });

    it('calling /reset => 200', function(done){
      http.get('/reset', function(res) {
        assert.equal(res.statusCode, 200);
        done();
      });
    });
  });
});
