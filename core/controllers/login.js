var
  express = require('express'),
  router = express.Router();

router.get('/sink', function(req, res) {
  res.send('ok');
});

router.post('/sink', function(req, res) {
  res.send('ok');
});

module.exports = router;
