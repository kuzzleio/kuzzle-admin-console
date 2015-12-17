var
  express = require('express'),
  router = express.Router();

router.get('/', function(req, res) {

  return res.render('login/index');

});

router.get('/form', function(req, res) {

  return res.render('login/form');

});

module.exports = router;
