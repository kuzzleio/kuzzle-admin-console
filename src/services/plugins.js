import store from '../vuex/store'
import * as pluginMutations from '../vuex/modules/plugins/mutation-types'

const pluginList = [
  'kuzzle-bo-plugin-dummy'
]

export default {
  loadAll () {
    pluginList.forEach((pluginName) => {
      this.loadOne(pluginName)
    })
  },
  loadOne (pluginName) {
    require(['../../plugins/' + pluginName + '/index'], (plugin) => {
      plugin.init({
        store,
        mutations: pluginMutations
      })
    })
  }
}
