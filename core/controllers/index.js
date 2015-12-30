var
  express = require('express'),
  router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    layout: 'default',
    development: !!process.env.DEVELOPMENT
  });
});

router.get('/logged', function(req, res) {
  return res.render('layouts/logged');
});

router.get('/404', function(req, res) {
  return res.render('layouts/404');
});


module.exports = router;
