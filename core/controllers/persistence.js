var
  express = require('express'),
  router = express.Router();

router.get('/browse', function(req, res) {

  if (!req.xhr) {
    return res.render('persistence/browse');
  }


});

module.exports = router;