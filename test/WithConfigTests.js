var assert = require('assert')
var expressMock = require('../src/ExpressMock').ExpressMock;
var http = require('./httpHelper');

describe('ExpressMock', function(){
  var templates = [
    {
      "id": "10",
      "name": "MOBILE CHANGED"
    },
    {
      "id": "11",
      "name": "SMS OPT IN"
    },
    {
      "id": "12",
      "name": "MARKETING OPT OUT"
    }
  ];

  var server = new expressMock({
    'port': http.port,
    'configFilePath': 'test/resources/BasicConfig.json'
  });

  before(function(done) {
    server.start(done);
  });

  beforeEach(function(done) {
    http.get('/reset', function() {
      done();
    });
  });

  after(function(done) {
    http.terminate();
    server.stop(done);
  });

  describe('With BasicConfig', function(){

    it('calling GET on unknown endpoint => 404 - NO_SUCH_ENDPOINT', function(done){
      http.get('/unknown', function(res) {
        assert.equal(res.statusCode, 404);
        assert.equal(res.body.code, 'NO_SUCH_ENDPOINT');
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

    it('calling GET on /templates/3 => 404 - NOT_FOUND_IN_STORE', function(done){
      http.get('/templates/3', function(res) {
        assert.equal(res.statusCode, 404);
        assert.equal(res.body.code, 'NOT_FOUND_IN_STORE');
        done();
      });
    });

    it('calling DELETE on unknown endpoint => 404 - NO_SUCH_ENDPOINT', function(done){
      http.delete('/unknown', function(res) {
        assert.equal(res.statusCode, 404);
        assert.equal(res.body.code, 'NO_SUCH_ENDPOINT');
        done();
      });
    });

    it('calling DELETE on /templates => 204 (all records removed)', function(done){
      http.delete('/templates', function(res) {
        assert.equal(res.statusCode, 204);
        http.get('/templates', function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.body.length, 0);
          done();
        });
      });
    });

    it('calling DELETE on /templates/2 => 204 (single record removed)', function(done){
      http.delete('/templates/2', function(res) {
        assert.equal(res.statusCode, 204);
        http.get('/templates', function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0].id, '1');
          done();
        });
      });
    });

    it('calling DELETE on /templates/3 => 404 - NOT_FOUND_IN_STORE', function(done){
      http.delete('/templates/3', function(res) {
        assert.equal(res.statusCode, 404);
        assert.equal(res.body.code, 'NOT_FOUND_IN_STORE');
        done();
      });
    });

    it('calling PUT on unknown endpoint => 404 - NO_SUCH_ENDPOINT', function(done){
      http.put({
        id: 1,
        name: 'NEW ADDRESS'
      },'/unknown', function(res) {
        assert.equal(res.statusCode, 404);
        assert.equal(res.body.code, 'NO_SUCH_ENDPOINT');
        done();
      });
    });

    it('calling PUT on /templates => 200 (whole collection replaced)', function(done) {
      http.put(templates, '/templates', function(res) {
        assert.equal(res.statusCode, 200);
        http.get('/templates', function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.body.length, 3);
          assert.equal(res.body[0].id, '10');
          assert.equal(res.body[1].id, '11');
          assert.equal(res.body[2].id, '12');
          done();
        });
      });
    });

    it('calling PUT on /templates/1 with a collection => 400 (single object expected)', function(done) {
      http.put(templates, '/templates/1', function(res) {
        assert.equal(res.statusCode, 400);
        assert.equal(res.body.code, 'BAD_REQUEST');
        assert.equal(res.body.message, 'Single object expected but found collection');
        done()
      });
    });

    it('calling PUT on /templates/1 => 200 - resource updated', function(done) {
      http.put({
        id: 1,
        name: 'CHECKOUT'
      }, '/templates/1', function(res) {
        assert.equal(res.statusCode, 200);
        http.get('/templates/1', function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.body.id, '1');
          assert.equal(res.body.name, 'CHECKOUT');
          done();
        });
      });
    });
  });
});
