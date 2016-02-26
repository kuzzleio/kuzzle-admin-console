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
  return kuzzle
    .security
    .createRolePromise(roleId, userRoles[roleId], {replaceIfExist: true});
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
  return kuzzle
    .security
    .createUserPromise(username, userContent);
};

router.post('/firstAdmin', function (req, res) {
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
      res.status(500).send(err).end();
    });
});

module.exports = router;
