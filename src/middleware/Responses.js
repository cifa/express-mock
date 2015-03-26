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
    res.status(404).send(JSON.stringify({
      'httpStatus': 404,
      'code': 'NO_SUCH_ENDPOINT',
      'message': req.header('host') + req.url + ' not found'
    }));
  }
};
