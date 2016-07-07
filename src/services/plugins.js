import store from '../vuex/store'
import * as pluginMutations from '../vuex/modules/plugins/mutation-types'

const pluginList = [
  'dummy'
]

export default {
  loadAll () {
    pluginList.forEach((pluginName) => {
      this.loadOne(pluginName)
    })
  },
  loadOne (pluginName) {
    // require(['../../node_modules/kuzzle-bo-plugin-' + pluginName + '/index'], (plugin) => {
    require(['../../plugins/kuzzle-bo-plugin-' + pluginName + '/index'], (plugin) => {
      plugin.init({
        store,
        mutations: pluginMutations
      })
    })
  }
}
