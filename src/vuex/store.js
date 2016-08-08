import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth/store'
import data from './modules/data/store'
import crudlDocument from './modules/common/crudlDocument/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    data,
    crudlDocument
  },
  strict: process.env.NODE_ENV !== 'production'
})
