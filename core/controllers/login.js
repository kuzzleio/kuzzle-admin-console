var
  express = require('express'),
  router = express.Router();

router.get('/', function(req, res) {

  return res.render('login/index');

});

router.get('/form', function(req, res) {

  return res.render('login/form');

});

router.get('/sink', function(req, res) {
  res.send('ok');
});

router.post('/sink', function(req, res) {
  res.send('ok');
});

module.exports = router;
