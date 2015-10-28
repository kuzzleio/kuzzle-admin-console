var
  express = require('express'),
  router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {layout: 'default'});
});

module.exports = router;
