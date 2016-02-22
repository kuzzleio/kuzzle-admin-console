var
  express = require('express'),
  router = express.Router(),
  request = require('request-promise');

router.get('/', function(req, res) {

  if (process.env.TEST === '1') {
    // /!\ UGLY HACK /!\ \\
    return res.render('login/index');
  }

  request({
    method: 'GET',
    uri: 'http://kuzzle:7511/api/1.0/roles/admin',
    json: true
  })
    .then(function () {
      // we can access to the admin role, so no admin account have been created yet
      return res.render('user/firstAdmin');
    })
    .catch(function () {
      // We got 401 HTTP error: the first admin has already been created !
      return res.render('login/index');
    });
});

router.get('/form', function(req, res) {
  return res.render('login/form');
});

router.get('/sink', function(req, res) {
  res.send('ok');
});

router.post('/sink', function(req, res) {
  res.send('ok');
});

module.exports = router;
