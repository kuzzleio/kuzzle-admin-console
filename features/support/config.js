var config = {}

config.kuzzleHost = process.env['TEST_KUZZLE_HOST'] || 'kuzzle';
config.kuzzlePort = process.env['TEST_KUZZLE_PORT'] || '7512';
config.indexName = process.env['TEST_KUZZLE_INDEX_NAME'] || 'mainindex';
config.username = 'titi';
config.password = 'toto';
config.authCookieName = 'authToken';

module.exports = config;
