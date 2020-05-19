import { WebSocket } from 'kuzzle-sdk/dist/kuzzle'
import Promise from 'bluebird'
import Vue from 'vue'
import omit from 'lodash/omit'

export const waitForConnected = (timeout = 1000) => {
  if (Vue.prototype.$kuzzle.protocol.state !== 'connected') {
    return new Promise((resolve, reject) => {
      let id
      // Timeout, if kuzzle doesn't respond in 1s (default) -> reject
      let timeoutId = setTimeout(() => {
        Vue.prototype.$kuzzle.removeListener('connected', id)
        reject(new Error('Kuzzle does not respond'))
      }, timeout)

      id = Vue.prototype.$kuzzle.addListener('connected', () => {
        clearTimeout(timeoutId)
        Vue.prototype.$kuzzle.removeListener('connected', id)
        resolve()
      })
    })
  }

  return Promise.resolve()
}

export const disconnect = () => {
  Vue.prototype.$kuzzle.disconnect()
  Vue.prototype.$kuzzle.jwt = null
}

export const connectToEnvironment = async environment => {
  // fix default port for users that have an old environment settings in their localStorage:
  if (environment.port === undefined) environment.port = 7512
  if (typeof environment.ssl !== 'boolean') environment.ssl = false

  if (Vue.prototype.$kuzzle.protocol.state === 'connected') {
    disconnect()
  }

  Vue.prototype.$kuzzle.protocol = new WebSocket(environment.host, {
    port: parseInt(environment.port),
    sslConnection: environment.ssl
  })

  await Vue.prototype.$kuzzle.connect()
}

// ### Data

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

export const performSearchDocuments = async (
  collection,
  index,
  filters = { query: {} },
  pagination = {},
  sort = []
) => {
  if (!collection || !index) {
    throw new Error('Missing collection or index')
  }

  const result = await Vue.prototype.$kuzzle.document.search(
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

  const totalDocument = await Vue.prototype.$kuzzle.document.count(
    index,
    collection,
    { query: filters.query }
  )

  return { documents, total: totalDocument }
}

export const getMappingDocument = async (collection, index) => {
  // @todo Use the SDK method after
  // https://github.com/kuzzleio/sdk-javascript/pull/507 is merged
  const request = {
    controller: 'collection',
    action: 'getMapping',
    index,
    collection,
    includeKuzzleMeta: true
  }

  const response = await Vue.prototype.$kuzzle.query(request)

  return response.result
}

export const performDeleteDocuments = async (index, collection, ids) => {
  if (
    !ids ||
    !Array.isArray(ids) ||
    ids.length === 0 ||
    !index ||
    !collection
  ) {
    throw new Error('ids<Array> parameter is required')
  }

  const deleted = await Vue.prototype.$kuzzle.document.mDelete(
    index,
    collection,
    ids,
    { refresh: 'wait_for' }
  )

  return deleted
}

// ### Security

// Users related
export const performSearchUsers = async (
  collection,
  index,
  filters = {},
  pagination = {},
  sort = []
) => {
  const strategies = await Vue.prototype.$kuzzle.auth.getStrategies()

  const result = await Vue.prototype.$kuzzle.security.searchUsers(
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
  for (const d of result.hits) {
    const u: any = {
      id: d._id,
      ...d.content,
      _kuzzle_info: formatMeta(d.content._kuzzle_info),
      credentials: {}
    }
    for (const strategy of strategies) {
      try {
        const res = await Vue.prototype.$kuzzle.security.getCredentials(
          strategy,
          d._id
        )
        u.credentials[strategy] = res
      } catch (e) {
        u.credentials[strategy] = {}
      }
    }

    users.push(u)
  }

  return { documents: users, total: result.total }
}

export const getMappingUsers = () => {
  return Vue.prototype.$kuzzle.security.getUserMapping()
}

export const updateMappingUsers = newMapping => {
  return Vue.prototype.$kuzzle.security.updateUserMapping({
    properties: newMapping
  })
}

export const performDeleteUsers = async (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  await Vue.prototype.$kuzzle.security.mDeleteUsers(ids, {
    refresh: 'wait_for'
  })
}

// Profiles related
export const performSearchProfiles = async (filters = {}, pagination = {}) => {
  const result = await Vue.prototype.$kuzzle.security.searchProfiles(
    { ...filters },
    { size: 100, ...pagination }
  )

  const profiles = result.hits.map(document => {
    return omit(document, '_kuzzle')
  })
  return { documents: profiles, total: result.total }
}

export const performDeleteProfiles = async (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  await Vue.prototype.$kuzzle.security.mDeleteProfiles(ids, {
    refresh: 'wait_for'
  })
}

// Roles related
export const performSearchRoles = async (controllers = {}, pagination = {}) => {
  const result = await Vue.prototype.$kuzzle.security.searchRoles(controllers, {
    ...pagination
  })
  let roles = result.hits.map(document => {
    return omit(document, '_kuzzle')
  })

  return { documents: roles, total: result.total }
}

export const getMappingRoles = async () => {
  return Vue.prototype.$kuzzle.security.getRoleMapping()
}

export const performDeleteRoles = async ids => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  await Vue.prototype.$kuzzle.security.mDeleteRoles(ids, {
    refresh: 'wait_for'
  })
}
