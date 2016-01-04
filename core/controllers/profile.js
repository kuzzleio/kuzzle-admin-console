var
  express = require('express'),
  router = express.Router();

router.get('/', function(req, res) {

  return res.render('profile/index');

});

router.get('/browse', function(req, res) {

  return res.render('profile/browse');

});

router.get('/create', function (req, res) {

  return res.render('profile/full', {action: 'create'});

});

router.get('/full', function (req, res) {

  return res.render('profile/full', {action: 'edit'});

});

module.exports = router;

