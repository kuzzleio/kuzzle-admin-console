var
  express = require('express'),
  router = express.Router(),
  q = require('q'),
  rc = require('rc'),
  userRoles = rc('roles'),
  kuzzle = require('../services/kuzzle')();

router.get('/', function(req, res) {

  return res.render('user/index');

});

router.get('/browse', function(req, res) {

  return res.render('user/browse');

});

router.get('/create', function (req, res) {

  return res.render('user/full', {action: 'create'});

});

router.get('/full', function (req, res) {

  return res.render('user/full', {action: 'edit'});

});

// first admin creation

var resetRole = function (roleId) {
  console.log('rr',userRoles[roleId]);
  return kuzzle
    .security
    .updateRolePromise(roleId, userRoles[roleId]);
};

var resetProfile = function (profileId, roleId) {
  var data = {
    roles: [ roleId ]
  };

  return kuzzle
    .security
    .updateProfilePromise(profileId, data); 
};

var createAdminUser = function (username, password) {
  var userContent = {
    password: password,
    profile: 'admin'
  };
  console.log('cred',[username, password]);
  return kuzzle
    .security
    .createUserPromise(username, userContent);
};

router.post('/firstAdmin', function (req, res) {
console.log('req.body', req.body);
  createAdminUser(req.body.username, req.body.password)
    .then(function () {
      if (req.body.resetroles) {
        return resetProfile('default', 'default');
      }
      return q.resolve();
    })
    .then(function () {
      if (req.body.resetroles) {
        return resetProfile('admin', 'admin');
      }
      return q.resolve();
    })
    .then(function () {
      if (req.body.resetroles) {
        return resetProfile('anonymous', 'anonymous');
      }
      return q.resolve();
    })
    .then(function () {
      if (req.body.resetroles) {
        return resetRole('default');
      }
      return q.resolve();
    })
    .then(function () {
      if (req.body.resetroles) {
        return resetRole('admin');
      }
      return q.resolve();
    })
    .then(function () {
      if (req.body.resetroles) {
        return resetRole('anonymous');
      }
      return q.resolve();
    })
    .then(function () {
      res.status(200).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
});

module.exports = router;
