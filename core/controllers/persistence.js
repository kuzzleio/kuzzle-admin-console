var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle');

router.get('/browse', function(req, res) {

  console.log(kuzzle);
  if (!req.xhr) {
    return res.render('persistence/browse');
  }



});

module.exports = router;