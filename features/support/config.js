var config = {}

config.kuzzleHost = process.env['KUZZLE_HOST'] || 'kuzzle';
config.kuzzlePort = process.env.KUZZLE_PORT || '7512';
config.indexName = process.env.KUZZLE_INDEX_NAME || 'mainindex';

module.exports = config;
