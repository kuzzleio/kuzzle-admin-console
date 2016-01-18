var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle')(),
  _ = require('lodash'),
  bufferCancel = require('../services/bufferCancel');

router.get('/', function(req, res) {

  return res.render('indexes/index');

});

router.get('/create', function (req, res) {

  return res.render('indexes/full', {action: 'create'});

});

module.exports = router;
