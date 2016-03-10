require('./cogOptionsIndexes/cogOptionsIndexes.directive');
require('./indexesDropDownSearch/indexesDropDownSearch.directive');

angular.module('kuzzle.indexes', [
  'kuzzle.authentication',
  'kuzzle.headline',
  'kuzzle.indexesDropDownSearch',
  'kuzzle.indexesApi',
  'kuzzle.cogOptionsIndexes'
]);
