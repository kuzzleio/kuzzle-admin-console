var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle')();

router.get('/', function(req, res) {

  return res.render('realtime/index');

});

router.get('/watch-data', function(req, res) {

  return res.render('realtime/watch-data');

});


module.exports = router;

