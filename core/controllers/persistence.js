var
  express = require('express'),
  router = express.Router();

router.get('/browse', function(req, res) {
  res.render('persistence/browse');
});

module.exports = router;
