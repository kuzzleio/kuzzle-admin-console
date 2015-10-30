var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle'),
  _ = require('lodash');

router.get('/browse', function(req, res) {

  return res.render('storage/browse');

});

router.get('/browse-documents', function(req, res) {

  return res.render('storage/browse-documents');

});

router.get('/listCollection', function (req, res) {

  kuzzle
    .listCollectionsPromise()
    .then(function (response) {
      return res.json(response);
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });

});

router.post('/search', function (req, res) {

  var
    limit = 10,
    page = 1,
    pagination,
    queryParams = req.query,
    params = req.body,
    filter = params.filter,
    collection = params.collection;

  if (!collection) {
    return res.json({error: true, message: 'collection is missing'});
  }

  if (queryParams.page) {
    page = parseInt(queryParams.page);
  }

  pagination = {
    from: (page - 1) * limit,
    size: limit,
    sort: [
      '_uid'
    ]
  };

  filter = _.extend(pagination, filter);

  kuzzle
    .dataCollectionFactory(collection)
    .advancedSearchPromise(filter)
    .then(function (response) {
        return res.json({documents: response.documents, total: response.total, limit: limit});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });

});

router.post('/update', function (req, res) {

  var
    document = req.param('document'),
    collection = req.param('collection');

  if (!document) {
    return res.json({error: true, message: 'No document provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  kuzzle
    .dataCollectionFactory(collection)
    .replacePromise(document._id, document.body)
    .then(function () {
      return res.json({error: false});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });
});

router.get('/full', function (req, res) {

  return res.render('storage/full');

});

module.exports = router;