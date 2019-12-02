import { WebSocket, Kuzzle } from 'kuzzle-sdk/dist/kuzzle'

export default {
  install(Vue) {
    this.kuzzle = new Kuzzle(new WebSocket('localhost'))

    Vue.prototype.$kuzzle = this.kuzzle
  }
}
