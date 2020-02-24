import store from '../vuex/store'

export const DEFAULT_COLOR = '#002835'

export const deleteEnvironment = id => {
  if (store.state.kuzzle.currentId === id) {
    store.dispatch.auth.doLogout(store)
  }

  store.dispatch.kuzzle.deleteEnvironment(id)
}
