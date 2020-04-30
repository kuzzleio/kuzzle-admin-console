import store from '../vuex/store'

export const DEFAULT_COLOR = '#002835'

export const deleteEnvironment = id => {
  if (store.getters.kuzzle.currentEnvironmentId === id) {
    store.dispatch.auth.doLogout(store)
  }

  store.dispatch.kuzzle.deleteEnvironment(id)
}
