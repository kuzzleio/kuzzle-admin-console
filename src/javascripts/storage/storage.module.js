require('../common/jsonEdit/jsonEdit.directive');

angular.module('kuzzle.storage', [
  'kuzzle.authentication',
  'schemaForm',
  'kuzzle.schema',
  'kuzzle.jsonEdit'
]);
