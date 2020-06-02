import { Kuzzle, WebSocket } from 'kuzzle-sdk-v6'
import Promise from 'bluebird'
import omit from 'lodash/omit'

export const kuzzle = new Kuzzle(new WebSocket('localhost'))

// Helper for performSearch
let getValueAdditionalAttribute = (content, attributePath) => {
  let attribute = attributePath.shift()

  if (typeof content[attribute] === 'object') {
    return getValueAdditionalAttribute(content[attribute], attributePath)
  }

  return content[attribute]
}
const formatMeta = _kuzzle_info => ({
  author: _kuzzle_info.author === '-1' ? 'Anonymous (-1)' : _kuzzle_info.author,
  updater:
    _kuzzle_info.updater === '-1' ? 'Anonymous (-1)' : _kuzzle_info.updater,
  createdAt: _kuzzle_info.createdAt,
  updatedAt: _kuzzle_info.updatedAt
})

export class KuzzleWrapperV1 {
  version: string = '1'
  kuzzle: any = null

  constructor(sdk) {
    this.kuzzle = sdk
  }

  disconnect() {
    this.kuzzle.disconnect()
    this.kuzzle.jwt = null
  }

  async connectToEnvironment(environment) {
    // fix default port for users that have an old environment settings in their localStorage:
    if (environment.port === undefined) environment.port = 7512
    if (typeof environment.ssl !== 'boolean') environment.ssl = false

    if (this.kuzzle.protocol.state === 'connected') {
      this.disconnect()
    }

    this.kuzzle.protocol = new WebSocket(environment.host, {
      port: parseInt(environment.port),
      sslConnection: environment.ssl
    })

    try {
      await this.kuzzle.connect()
    } catch (error) {
      if (error.message.match(/^Incompatible SDK client/)) {
        const e = new Error(error)
        e['id'] = 'api.process.incompatible_sdk_version'
        throw e
      }
    }
  }

  async getMappingDocument(collection, index) {
    // @todo Use the SDK method after
    // https://github.com/kuzzleio/sdk-javascript/pull/507 is merged
    const request = {
      controller: 'collection',
      action: 'getMapping',
      index,
      collection
    }

    const response = await this.kuzzle.query(request)

    return response.result[index].mappings[collection]
  }

  async performDeleteDocuments(index, collection, ids) {
    if (
      !ids ||
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !index ||
      !collection
    ) {
      throw new Error('ids<Array> parameter is required')
    }

    const deleted = await this.kuzzle.document.mDelete(index, collection, ids, {
      refresh: 'wait_for'
    })

    return deleted
  }

  async performSearchUsers(
    collection,
    index,
    filters = {},
    pagination = {},
    sort = []
  ) {
    const strategies = await this.kuzzle.auth.getStrategies()

    const result = await this.kuzzle.security.searchUsers(
      { ...filters, sort },
      { ...pagination }
    )
    let additionalAttributeName: any = null

    if (sort.length > 0) {
      if (typeof sort[0] === 'string') {
        additionalAttributeName = sort[0]
      } else {
        additionalAttributeName = Object.keys(sort[0])[0]
      }
    }

    const users: Array<any> = []
    for (const user of result.hits) {
      const formattedUser: any = {
        id: user._id,
        ...user.content,
        _kuzzle_info: formatMeta(user.content._kuzzle_info),
        credentials: {}
      }
      for (const strategy of strategies) {
        try {
          const res = await this.kuzzle.security.getCredentials(
            strategy,
            user._id
          )
          formattedUser.credentials[strategy] = res
        } catch (e) {
          formattedUser.credentials[strategy] = {}
        }
      }

      users.push(formattedUser)
    }

    return { documents: users, total: result.total }
  }

  getMappingUsers() {
    return this.kuzzle.security.getUserMapping()
  }

  updateMappingUsers(newMapping) {
    return this.kuzzle.security.updateUserMapping({
      properties: newMapping
    })
  }

  async performDeleteUsers(index, collection, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'))
    }

    await this.kuzzle.security.mDeleteUsers(ids, {
      refresh: 'wait_for'
    })
  }

  async performSearchProfiles(filters = {}, pagination = {}) {
    const result = await this.kuzzle.security.searchProfiles(
      { ...filters },
      { size: 100, ...pagination }
    )

    const profiles = result.hits.map(document => {
      return omit(document, '_kuzzle')
    })
    return { documents: profiles, total: result.total }
  }

  async performDeleteProfiles(index, collection, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'))
    }

    await this.kuzzle.security.mDeleteProfiles(ids, {
      refresh: 'wait_for'
    })
  }

  async performSearchDocuments(
    collection,
    index,
    filters = { query: {} },
    pagination = {},
    sort = []
  ) {
    if (!collection || !index) {
      throw new Error('Missing collection or index')
    }

    const result = await this.kuzzle.document.search(
      index,
      collection,
      { ...filters, sort },
      { ...pagination }
    )

    const documents = result.hits.map(d => ({
      id: d._id,
      ...d._source,
      _kuzzle_info: d._source._kuzzle_info
        ? formatMeta(d._source._kuzzle_info)
        : undefined
    }))

    const totalDocument = await this.kuzzle.document.count(index, collection, {
      query: filters.query
    })

    return { documents, total: totalDocument }
  }

  async performSearchRoles(controllers = {}, pagination = {}) {
    const result = await this.kuzzle.security.searchRoles(controllers, {
      ...pagination
    })
    let roles = result.hits.map(document => {
      return omit(document, '_kuzzle')
    })

    return { documents: roles, total: result.total }
  }

  async getMappingRoles() {
    return this.kuzzle.security.getRoleMapping()
  }

  async performDeleteRoles(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'))
    }

    await this.kuzzle.security.mDeleteRoles(ids, {
      refresh: 'wait_for'
    })
  }
}

export const wrapper = new KuzzleWrapperV1(kuzzle)
