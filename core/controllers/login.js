var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle')();

router.get('/', function(req, res) {

  kuzzle
    .dataCollectionFactory('%kuzzle', 'users')
    .fetchAllDocumentsPromise()
    .then(function (result) {
      // if (result.total > 0) {
      //   // there are users already, lets allow them to login
      //   return res.render('login/index');
      // }
      // if there are no users, we should create one
      return res.render('user/firstAdmin');
    })
    .catch(function () {
      // we probably do not have the right to list users,
      // so the rights have been reseted
      // we show the login page
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
