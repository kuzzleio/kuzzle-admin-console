var
  express = require('express'),
  router = express.Router(),
  kuzzle = require('../services/kuzzle'),
  _ = require('lodash');

router.get('/get', function (req, res) {

  var
    queryParams = req.query,
    collection = queryParams.collection;


  if (!collection) {
    return res.json({error: true, message: 'collection is missing'});
  }

  kuzzle
    .dataCollectionFactory(collection)
    .getMappingPromise()
    .then(function (response) {
      return res.json({mapping: response.mapping});
    })
    .catch(function (error) {
      return res.json({error: true, message: error});
    });

});

module.exports = router;