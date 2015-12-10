var
  express = require('express'),
  router = express.Router();

router.get('/', function(req, res) {

  return res.render('realtime/index');

});

router.get('/watch-data', function(req, res) {

  return res.render('realtime/watch-data');

});

module.exports = router;

