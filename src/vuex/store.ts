import Vue from 'vue'
import Vuex from 'vuex'
import { createDirectStore } from 'direct-vuex'
import auth from './modules/auth/store'
import crudlDocument from './modules/common/crudlDocument/store'
import kuzzle from './modules/common/kuzzle/store'
import routing from './modules/common/routing/store'
import collection from './modules/collection/store'
import toaster from './modules/common/toaster/store'
import index from './modules/index/store'
import security from './modules/security/store'

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
  modules: {
    auth,
    crudlDocument,
    kuzzle,
    collection,
    routing,
    toaster,
    index,
    security
  },
  strict: process.env.NODE_ENV !== 'production'
})

// export default new Vuex.Store(store)
export default store

export { rootActionContext, moduleActionContext }

export type AppStore = typeof store
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore
  }
}
