var
  express = require('express'),
  router = express.Router(),
  request = require('request-promise'),
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
      return resetProfile('default', 'default');
    })
    .then(function () {
      return resetProfile('admin', 'admin');
    })
    .then(function () {
      return resetProfile('anonymous', 'anonymous');
    })
    .then(function () {
      return resetRole('default');
    })
    .then(function () {
      return resetRole('admin');
    })
    .then(function () {
      return resetRole('anonymous');
    })
    .then(function () {
      res.status(200).end();
    })
    .catch(function (err) {
      res.status(err.statusCode).end();
    });
});

module.exports = router;
