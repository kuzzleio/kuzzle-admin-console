var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle')(),
  _ = require('lodash'),
  bufferCancel = require('../services/bufferCancel');

router.get('/', function(req, res) {

  return res.render('storage/index');

});

router.get('/browse', function(req, res) {

  return res.render('storage/browse');

});

router.get('/browse-documents', function(req, res) {

  return res.render('storage/browse-documents');

});

router.get('/create', function (req, res) {

  return res.render('storage/full', {action: 'create'});

});

router.get('/full', function (req, res) {

  return res.render('storage/full', {action: 'edit'});

});


router.post('/search', function (req, res) {

  var
    limit = 10,
    page = 1,
    pagination,
    queryParams = req.query,
    params = req.body,
    filter = params.filter,
    collection = params.collection,
    index = params.index,
    globalFilter;

  if (!collection) {
    return res.json({error: true, message: 'collection is missing'});
  }

  if (!index) {
    return res.json({error: true, message: 'index is missing'});
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

  globalFilter = {
    filter: {
      and: [
        {not: {ids: {values: bufferCancel.getExcludedIds()}}}
      ]
    }
  };

  if (filter.filter) {
    globalFilter.filter.and.push(filter.filter);
  }

  if (filter.query) {
    globalFilter.query = filter.query;
  }

  globalFilter = _.extend(pagination, globalFilter);

  kuzzle
    .dataCollectionFactory(index, collection)
    .advancedSearchPromise(globalFilter)
    .then(function (response) {
      return res.json({documents: response.documents, total: response.total, limit: limit});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });

});

router.post('/deleteById', function (req, res) {

  var
    id = req.body.id,
    collection = req.body.collection,
    index = req.body.index,
    buffer = req.body.buffer,
    clientId = req.body.clientId;

  if (!id) {
    return res.json({error: true, message: 'No id provided'});
  }

  if (!index) {
    return res.json({error: true, message: 'No index provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  if (!clientId) {
    return res.json({error: true, message: 'No clientId provided'});
  }

  if (!buffer) {
    return kuzzle
      .dataCollectionFactory(index, collection)
      .deleteDocumentPromise(id)
      .then(function () {
        return res.json({error: false});
      })
      .catch(function (error) {
        return res.json({error: true, message: error});
      });
  }

  bufferCancel.add('deleteById', clientId, index, collection, id, true);
  bufferCancel.delayExecution('deleteById', clientId, index, collection, id, function () {

    kuzzle
      .dataCollectionFactory(index, collection)
      .deleteDocumentPromise(id);
  });

  return res.json({error: false});
});

router.post('/cancel-deleteById', function (req, res) {

  var
    id = req.body.id,
    collection = req.body.collection,
    index = req.body.index,
    clientId = req.body.clientId;

  if (!id) {
    return res.json({error: true, message: 'No id provided'});
  }

  if (!index) {
    return res.json({error: true, message: 'No index provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  if (!clientId) {
    return res.json({error: true, message: 'No clientId provided'});
  }

  bufferCancel.cancel('deleteById', clientId, index, collection, id);
  return res.json({error: false});
});

module.exports = router;

