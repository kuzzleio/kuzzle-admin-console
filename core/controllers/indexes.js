var
  express = require('express'),
  router = express.Router();

router.get('/', function(req, res) {
  return res.render('indexes/index');
});

router.get('/create', function (req, res) {
  return res.render('indexes/full', {action: 'create'});
});

router.get('/browse', function(req, res) {
  return res.render('indexes/browse', {action: 'create'});
});

module.exports = router;
