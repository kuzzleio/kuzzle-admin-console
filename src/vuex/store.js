import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth/store'
import common from './modules/common/store'
import plugins from './modules/plugins/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common,
    auth,
    plugins
  },
  strict: process.env.NODE_ENV !== 'production'
})
