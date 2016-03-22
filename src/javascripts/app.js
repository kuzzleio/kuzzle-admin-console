// Look ma, require!
require('oclazyload');
require('jsonformatter');
require('bootstrap');

// Look ma, CSS!
require('angular-loading-bar/build/loading-bar.min.css');
require('bootstrap/dist/css/bootstrap.min.css');
require('leaflet/dist/leaflet.css');
require('jsonformatter/dist/json-formatter.min.css');
require('angular-ui-notification/dist/angular-ui-notification.min.css');
require('font-awesome/css/font-awesome.min.css');

// Look ma, SASS!
// TODO move every style to the corresponding section
require('../sass/login.scss');
require('../sass/storage.scss');
require('../sass/realtime.scss');
require('../sass/navbar.scss');
require('../sass/notifications.scss');
require('../sass/modal.scss');
require('../sass/collection.scss');
require('../sass/basicFilter.scss');
require('../sass/documents-inline.scss');
require('../sass/metrics.scss');
require('../sass/common.scss');

// Look ma, ES6!
import uirouter from 'angular-ui-router';
import loadingBar from 'angular-loading-bar';
import sanitize from 'angular-sanitize';
import uiNotification from 'angular-ui-notification';
import uiBootstrap from 'angular-bootstrap-npm';
import ngAnimate from 'angular-animate';

var Highcharts = require('highcharts/highstock');
var MoreHighcharts = require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/exporting')(Highcharts);

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

require('./common/kuzzleSdk.service');
require('./common/bufferCancel.service');
require('./common/documentApi.service');
require('./common/indexesApi.service');
require('./common/collectionApi.service');
require('./common/roleApi.service');
require('./common/profileApi.service');
require('./common/userApi.service');
require('./common/serverApi.service');
require('./common/schema.service.js');
require('./common/uid.service.js');
require('./common/previousState.service.js');
require('./common/unsubscribeOnPageChange.service.js');
require('./common/authentication/authentication.module');
require('./common/authentication/authentication.service');
require('./common/authentication/loginModal.controller');
require('./common/authentication/authorizationApi.service');

import baseRouting from './baseRouting';
require('./indexes/indexes.route');
require('./storage/storage.route');
require('./collection/collection.route');
require('./realtime/realtime.route');
require('./role/role.route');
require('./profile/profile.route');
require('./user/user.route');
require('./metrics/metrics.route');

angular.module('kuzzle', [
  uirouter,
  sanitize,
  uiBootstrap,
  uiNotification,
  loadingBar,
  ngAnimate,
  'oc.lazyLoad',
  'jsonFormatter',
  'kuzzle.authentication',
  'kuzzle.headline',
  'kuzzle.indexes',
  'kuzzle.storage',
  'kuzzle.collection',
  'kuzzle.realtime',
  'kuzzle.role',
  'kuzzle.profile',
  'kuzzle.user',
  'kuzzle.metrics',
  'kuzzle.bufferCancel',
  'kuzzle.documentApi',
  'kuzzle.indexesApi',
  'kuzzle.collectionApi',
  'kuzzle.serverApi',
  'kuzzle.uid',
  'kuzzle.previousState',
  'kuzzle.unsubscribeOnPageChange',
])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  }])

  .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-wrapper';
  }])

  .config(['NotificationProvider', function (NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 5000,
      closeOnClick: false
    });
  }])

  .config(baseRouting)

  .run(['$rootScope', 'AUTH_EVENTS', 'AuthService', '$state', function ($rootScope, AUTH_EVENTS, AuthService, $state) {
    $rootScope.$on('$stateNotFound', function(event) {
      $state.go('404');
    });

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      $state.go('login');
    });

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
      var next = AuthService.getNextRoute();
      if (next) {
        $state.go(next.name, next.params, {reload: true, notify: true});
      } else {
        $state.go('logged', null, {reload: true, notify: true});
      }
      AuthService.nextRoute = null;
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error && error.type === 'NOT_AUTHENTICATED') {
        AuthService.setNextRoute(toState.name, toParams);
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    });
  }]);

require('./common/mainApp.controller');
require('./common/sidebar.controller');
require('./common/authentication/login.controller');
require('./common/authentication/formAutoFillFix.directive');
require('./common/authentication/userMenu.directive');
require('./common/headline/headline.directive');
