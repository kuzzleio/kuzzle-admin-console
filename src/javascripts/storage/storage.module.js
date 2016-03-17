require('../common/jsonEdit/jsonEdit.directive');
require('../common/schema.service.js');

angular.module('kuzzle.storage', [
  'kuzzle.authentication',
  'schemaForm',
  'kuzzle.schema',
  'kuzzle.jsonEdit'
]);
