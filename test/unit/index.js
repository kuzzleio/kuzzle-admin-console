// Polyfill fn.bind() for PhantomJS
/* eslint-disable no-extend-native */
Function.prototype.bind = require('function-bind')

// Require the store since it is needed by the tests on the mutations.
require('../../src/vuex/store')

// Require test files (files that ends with .spec.js)
const testsServicesContext = require.context('./specs/services', true, /\.spec$/)
testsServicesContext.keys().forEach(testsServicesContext)
const testsVuexContext = require.context('./specs/vuex', true, /\.spec$/)
testsVuexContext.keys().forEach(testsVuexContext)
