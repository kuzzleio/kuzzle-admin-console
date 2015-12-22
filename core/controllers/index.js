var
  express = require('express'),
  router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {layout: 'default'});
});

router.get('/logged', function(req, res) {
  return res.render('layouts/logged');
});


module.exports = router;
