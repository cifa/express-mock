var assert = require('assert')
var expressMock = require('../lib/ExpressMock').ExpressMock;
var http = require('./httpHelper');

describe('ExpressMock', function(){

  var server = new expressMock({
    'port': http.port,
    'configFilePath': 'test/resources/BasicConfig.json'
  });

  before(function(done) {
    server.start(done);
  });

  beforeEach(function(done) {
    http.get('/__reset__', function() {
      done();
    });
  });

  after(function(done) {
    http.terminate();
    server.stop(done);
  });

  describe('With BasicConfig', function(){

    it('default scheduled response is 500 on the root for GET', function(done){
      http.post(null, '/__schedule__', function(res) {
        assert.equal(res.statusCode, 200);
        http.get('/', function(res) {
          assert.equal(res.statusCode, 500);
          done();
        });
      });
    });

    it('scheduled response is applied only once', function(done){
      http.post({path: '/templates'}, '/__schedule__', function(res) {
        assert.equal(res.statusCode, 200);
        http.get('/templates', function(res) {
          assert.equal(res.statusCode, 500);
          http.get('/templates', function(res) {
            assert.equal(res.statusCode, 200);
            done();
          });
        });
      });
    });

    it('scheduled response status can be provided', function(done){
      http.post({path: '/templates', status: 302}, '/__schedule__', function(res) {
        assert.equal(res.statusCode, 200);
        http.get('/templates', function(res) {
          assert.equal(res.statusCode, 302);
          done();
        });
      });
    });

    it('scheduled response body can be provided', function(done){
      var schedRes = {
            path: '/templates',
            body: {msg: 'Validation failed'},
            status: 400
          };
      http.post(schedRes, '/__schedule__', function(res) {
        assert.equal(res.statusCode, 200);
        http.get('/templates', function(res) {
          assert.equal(res.statusCode, 400);
          assert.equal(res.body.msg, 'Validation failed');
          done();
        });
      });
    });

    it('scheduled response headers can be provided', function(done){
      var schedRes = {
            path: '/templates',
            headers: {
              'x-header': 'test header'
            },
            status: 503
          };
      http.post(schedRes, '/__schedule__', function(res) {
        assert.equal(res.statusCode, 200);
        http.get('/templates', function(res) {
          assert.equal(res.statusCode, 503);
          assert.equal(res.headers['x-header'], 'test header');
          done();
        });
      });
    });

  });
});
