/**
 * Config object contains attribute kuzzleUrl.
 * kuzzleUrl must be null if you want to use the same url for Kuzzle and you bo (like localhost:3000 for BO and localhost:7512 for Kuzzle)
 * If you have a different url for Kuzzle, you have to write an URL with the port like 'http://mykuzzle:7512'.
 *
 * @type {{kuzzleUrl: string}}
 */
var config = {
  kuzzleUrl: KUZZLE_URL,
  kuzzleCoreIndex: '%kuzzle'
};

module.exports = config;
