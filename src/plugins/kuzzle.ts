import { WebSocket, Kuzzle } from 'kuzzle-sdk/dist/kuzzle'

export default {
  install(Vue) {
    const kuzzle = new Kuzzle(new WebSocket('localhost'))

    Vue.prototype.$kuzzle = kuzzle
  }
}
