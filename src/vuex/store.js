import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import common from './modules/common'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common,
    auth
  },
  strict: process.env.NODE_ENV !== 'production'
})
