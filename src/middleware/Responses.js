(function() {
  exports.default = function(req, res) {
    res.set('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') {
      res.status(200);
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Headers', 'origin, content-type, accept, authorization, Access-Control-Allow-Origin');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD')
  		res.end();
    } else {
      reply404(req, res, 'NO_SUCH_ENDPOINT');
    }
  };

  exports.reply = function(result, req, res) {
    res.set('Content-Type', 'application/json');
    switch (result.status) {
      case 200:
        reply200(res, result.body);
        break;
      case 201:
        reply201(req, res, result.body);
        break;
      case 204:
        reply204(res);
        break;
      case 400:
        reply400(res, result.msg);
        break;
      case 404:
        reply404(req, res);
        break;
    }
  }

  function reply200(res, body) {
    res.status(200).send(JSON.stringify(body));
  };

  function reply201(req, res, body) {
    var location = req.protocol + '://' + req.header('host') + req.url;
    res.set('Location', location);
    res.status(201).send(JSON.stringify(body));
  };

  function reply204(res) {
    res.status(204).send();
  };

  function reply400(res, msg) {
    res.status(400).send(JSON.stringify({
      'httpStatus': 400,
      'code': 'BAD_REQUEST',
      'message': msg
    }));
  }

  function reply404(req, res, code) {
    res.status(404).send(JSON.stringify({
      'httpStatus': 404,
      'code': code || 'NOT_FOUND_IN_STORE',
      'message': req.header('host') + req.url + ' not found in store'
    }));
  };
})();
