var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle')(),
  _ = require('lodash');

router.get('/', function(req, res) {

  return res.render('collection/index');

});

router.get('/browse', function(req, res) {

  return res.render('collection/browse');

});

router.get('/create', function (req, res) {

  return res.render('collection/full', {action: 'create'});

});

router.get('/full', function (req, res) {

  return res.render('collection/full', {action: 'edit'});

});

module.exports = router;

