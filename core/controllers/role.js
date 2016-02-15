var
  express = require('express'),
  router = express.Router();

router.get('/', function(req, res) {

  return res.render('role/index');

});

router.get('/browse', function(req, res) {

  return res.render('role/browse');

});

router.get('/create', function (req, res) {

  return res.render('role/full', {action: 'create'});

});

router.get('/full', function (req, res) {

  return res.render('role/full', {action: 'edit'});

});

module.exports = router;

