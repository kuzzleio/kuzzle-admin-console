var
  express = require('express'),
  router = express.Router();

router.get('/', function (req, res) {
  return res.render('dashboard/index');
});

module.exports = router;

