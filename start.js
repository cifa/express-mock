(function() {
  var expressMock = require('./lib/ExpressMock').ExpressMock;
  new expressMock({
    'port': 4000,
    'configFilePath': 'RestrictedProducts.json',
    'rulesPlugin': 'RestrictedProducts'
  }).start();
})()
