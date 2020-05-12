import { createModule, createActions } from 'direct-vuex'
import { moduleActionContext } from '@/vuex/store'
import Vue from 'vue'

const actions = createActions({
  async fetchUserMapping(context) {
    const { rootCommit, rootGetters } = securityActionContext(context)

    const res = await rootGetters.kuzzle.sdk.query({
      controller: 'security',
      action: 'getUserMapping'
    })
    res.result.schema = {}
    rootCommit.collection.receiveCollectionDetail(res.result)
  },
  async fetchProfileMapping(context) {
    const { rootCommit, rootGetters } = securityActionContext(context)

    const res = await rootGetters.kuzzle.sdk.query({
      controller: 'security',
      action: 'getProfileMapping'
    })
    res.result.schema = {}
    rootCommit.collection.receiveCollectionDetail(res.result)
  },
  async fetchRoleMapping(context) {
    const { rootCommit, rootGetters } = securityActionContext(context)

    const res = await rootGetters.kuzzle.sdk.query({
      controller: 'security',
      action: 'getRoleMapping'
    })
    res.result.schema = {}
    rootCommit.collection.receiveCollectionDetail(res.result)
  }
})

const security = createModule({
  namespaced: true,
  actions
})

export default security
export const securityActionContext = (context: any) =>
  moduleActionContext(context, security)
