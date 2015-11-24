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

  if (!filter) {
    filter = {};
  }


  globalFilter = {
    filter: {
      and: [
        {not: {ids: {values: bufferCancel.getExcludedIds()}}},
        filter
      ]
    }
  };

  globalFilter = _.extend(pagination, globalFilter);

  kuzzle
    .dataCollectionFactory(collection)
    .advancedSearchPromise(globalFilter)
    .then(function (response) {
        return res.json({documents: response.documents, total: response.total, limit: limit});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });

});

router.post('/update', function (req, res) {
  var
    document = req.body.document,
    collection = req.body.collection,
    clientId = req.body.clientId;

  if (!document) {
    return res.json({error: true, message: 'No document provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  if (!clientId) {
    return res.json({error: true, message: 'No clientId provided'});
  }

  kuzzle
    .dataCollectionFactory(collection)
    .setHeaders({metadata: {clientId: clientId}})
    .replaceDocumentPromise(document._id, document.body)
    .then(function () {
      return res.json({error: false});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });
});

router.post('/create', function (req, res) {

  var
    collection = req.body.collection,
    document = req.body.document;

  if (!document) {
    return res.json({error: true, message: 'No document provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  kuzzle
    .dataCollectionFactory(collection.name)
    .createDocumentPromise(document)
    .then(function (response) {
      return res.json({error: false, id: response.id});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });
});

router.post('/deleteById', function (req, res) {

  var
    id = req.body.id,
    collection = req.body.collection,
    buffer = req.body.buffer,
    clientId = req.body.clientId;

  if (!id) {
    return res.json({error: true, message: 'No id provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  if (!clientId) {
    return res.json({error: true, message: 'No clientId provided'});
  }

  if (!buffer) {
    return kuzzle
      .dataCollectionFactory(collection)
      .deleteDocumentPromise(id)
      .then(function () {
        return res.json({error: false});
      })
      .catch(function (error) {
        return res.json({error: true, message: error});
      });
  }

  bufferCancel.add('deleteById', clientId, collection, id, true);
  bufferCancel.delayExecution('deleteById', clientId, collection, id, function () {

    kuzzle
      .dataCollectionFactory(collection)
      .deleteDocumentPromise(id);
  });

  return res.json({error: false});
});

router.post('/cancel-deleteById', function (req, res) {

  var
    id = req.body.id,
    collection = req.body.collection,
    clientId = req.body.clientId;

  if (!id) {
    return res.json({error: true, message: 'No id provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  if (!clientId) {
    return res.json({error: true, message: 'No clientId provided'});
  }

  bufferCancel.cancel('deleteById', clientId, collection, id);
  return res.json({error: false});
});

router.get('/getById', function (req, res) {

  var
    collection = req.query.collection,
    id = req.query.id;

  if (!id) {
    return res.json({error: true, message: 'No id provided'});
  }

  if (!collection) {
    return res.json({error: true, message: 'No collection provided'});
  }

  kuzzle
    .dataCollectionFactory(collection)
    .fetchDocumentPromise(id)
    .then(function (response) {
      return res.json({document: response});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });
});

module.exports = router;

