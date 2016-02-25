var
  express = require('express'),
  router = express.Router(),
  request = require('request-promise'),
  q = require('q'),
  rc = require('rc'),
  userRoles = rc('roles');

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
  return request({
    method: 'PUT',
    uri: 'http://kuzzle:7511/api/1.0/roles/' + roleId,
    body: userRoles[roleId],
    json: true
  });
};

var resetProfile = function (profileId, roleId) {
  var data = {
    _id: profileId,
    roles: [ roleId ]
  };

  return request({
    method: 'PUT',
    uri: 'http://kuzzle:7511/api/1.0/profiles/' + profileId,
    body: data,
    json: true
  });  
};

var createAdminUser = function (username, password) {
  var data = {
    _id: username,
    password: password,
    profile: 'admin'
  };

  return request({
    method: 'POST',
    uri: 'http://kuzzle:7511/api/1.0/users/_create',
    body: data,
    json: true
  });
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
      res.status(err.statusCode).end();
    });
});

module.exports = router;
