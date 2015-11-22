var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle')(),
  _ = require('lodash'),
  bufferCancel = require('../services/bufferCancel');

router.get('/', function(req, res) {

  return res.render('collection/index');

});

router.get('/browse', function(req, res) {

  return res.render('collection/browse');

});

router.get('/create', function (req, res) {

  return res.render('collection/full', {action: 'create'});

});

router.get('/full', function (req, res) {

  return res.render('collection/full', {action: 'edit'});

});


router.get('/list', function (req, res) {

  kuzzle
    .listCollectionsPromise()
    .then(function (response) {
      return res.json(response);
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });

});

router.post('/create', function (req, res) {

  var
    collection = req.body.collection;

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  if (!collection.name) {
    return res.json({error: true, message: 'No collection name provided'});
  }

  console.log(kuzzle);

  kuzzle
    .dataCollectionFactory(collection.name)
    .createPromise()
    .then(function () {
      return res.json({error: false});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });
});

router.post('/delete', function (req, res) {

  var
    collection = req.body.collection;

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  kuzzle
    .dataCollectionFactory(collection)
    .deletePromise()
    .then(function () {
      return res.json({error: false});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });
});


module.exports = router;

