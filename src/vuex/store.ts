import Vue from 'vue'
import Vuex from 'vuex'
import { createDirectStore } from 'direct-vuex'
import auth from './modules/auth/store'
import kuzzle from './modules/kuzzle/store'
import routing from './modules/common/routing/store'
import toaster from './modules/common/toaster/store'
import index from './modules/index/store'

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
  modules: {
    auth,
    kuzzle,
    routing,
    toaster,
    index
  },
  strict: import.meta.env.NODE_ENV !== 'production'
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
