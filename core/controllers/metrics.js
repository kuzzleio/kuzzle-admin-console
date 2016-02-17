var
  express = require('express'),
  router = express.Router();

router.get('/', function (req, res) {
  return res.render('metrics/index');
});

module.exports = router;

