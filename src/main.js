import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import * as pluginMutations from './vuex/modules/plugins/mutation-types'

Vue.config.debug = process.env.NODE_ENV !== 'production'

var plugin = require('../plugins/kuzzle-bo-plugin-dummy/index').default
plugin({
  store,
  mutations: pluginMutations
})

router.start({
  store,
  components: { App }
}, 'body')
