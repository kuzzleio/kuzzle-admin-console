import ngCookies from 'angular-cookies';

angular.module('kuzzle.authentication', [
  ngCookies,
  'kuzzle.kuzzleSdk',
  'kuzzle.authorization'
]);
