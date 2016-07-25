import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth/store'
import common from './modules/common/store'
import data from './modules/data/store'
import collection from './modules/collection/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common,
    auth,
    collection,
    data
  },
  strict: process.env.NODE_ENV !== 'production'
})
