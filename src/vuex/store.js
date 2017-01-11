import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth/store'
import data from './modules/data/store'
import crudlDocument from './modules/common/crudlDocument/store'
import kuzzle from './modules/common/kuzzle/store'
import routing from './modules/common/routing/store'
import collection from './modules/collection/store'
import toaster from './modules/common/toaster/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    data,
    crudlDocument,
    kuzzle,
    collection,
    routing,
    toaster
  },
  strict: process.env.NODE_ENV !== 'production'
})
