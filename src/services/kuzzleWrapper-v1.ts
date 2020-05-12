import { Kuzzle, WebSocket } from 'kuzzle-sdk-v6'
import Promise from 'bluebird'
import omit from 'lodash/omit'

export const kuzzle = new Kuzzle(new WebSocket('localhost'))

export const disconnect = () => {
  kuzzle.disconnect()
  kuzzle.jwt = null
}

export const connectToEnvironment = async environment => {
  // fix default port for users that have an old environment settings in their localStorage:
  if (environment.port === undefined) environment.port = 7512
  if (typeof environment.ssl !== 'boolean') environment.ssl = false

  if (kuzzle.protocol.state === 'connected') {
    disconnect()
  }

  kuzzle.protocol = new WebSocket(environment.host, {
    port: parseInt(environment.port),
    sslConnection: environment.ssl
  })

  await kuzzle.connect()
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

  const result = await kuzzle.document.search(
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

  const totalDocument = await kuzzle.document.count(index, collection, {
    query: filters.query
  })

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

  const response = await kuzzle.query(request)

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

  const deleted = await kuzzle.document.mDelete(index, collection, ids, {
    refresh: 'wait_for'
  })

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
  const strategies = await kuzzle.auth.getStrategies()

  const result = await kuzzle.security.searchUsers(
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
        const res = await kuzzle.security.getCredentials(strategy, d._id)
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
  return kuzzle.security.getUserMapping()
}

export const updateMappingUsers = newMapping => {
  return kuzzle.security.updateUserMapping({
    properties: newMapping
  })
}

export const performDeleteUsers = async (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  await kuzzle.security.mDeleteUsers(ids, {
    refresh: 'wait_for'
  })
}

// Profiles related
export const performSearchProfiles = async (filters = {}, pagination = {}) => {
  const result = await kuzzle.security.searchProfiles(
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

  await kuzzle.security.mDeleteProfiles(ids, {
    refresh: 'wait_for'
  })
}

// Roles related
export const performSearchRoles = async (controllers = {}, pagination = {}) => {
  const result = await kuzzle.security.searchRoles(controllers, {
    ...pagination
  })
  let roles = result.hits.map(document => {
    return omit(document, '_kuzzle')
  })

  return { documents: roles, total: result.total }
}

export const getMappingRoles = async () => {
  return kuzzle.security.getRoleMapping()
}

export const performDeleteRoles = async ids => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  await kuzzle.security.mDeleteRoles(ids, {
    refresh: 'wait_for'
  })
}

export const isKuzzleActionAllowed = (
  rights,
  controller,
  action,
  index,
  collection
) => {
  var filteredRights

  if (!rights || typeof rights !== 'object') {
    throw new Error(
      'rights parameter is mandatory for isActionAllowed function'
    )
  }
  if (!controller || typeof controller !== 'string') {
    throw new Error(
      'controller parameter is mandatory for isActionAllowed function'
    )
  }
  if (!action || typeof action !== 'string') {
    throw new Error(
      'action parameter is mandatory for isActionAllowed function'
    )
  }
  // We filter in all the rights that match the request (including wildcards).
  filteredRights = rights
    .filter(function(right) {
      return right.controller === controller || right.controller === '*'
    })
    .filter(function(right) {
      return right.action === action || right.action === '*'
    })
    .filter(function(right) {
      return right.index === index || right.index === '*'
    })
    .filter(function(right) {
      return right.collection === collection || right.collection === '*'
    })

  // Then, if at least one right allows the action, we return 'allowed'
  if (
    filteredRights.some(function(item) {
      return item.value === 'allowed'
    })
  ) {
    return 'allowed'
  }
  // Otherwise we return 'denied'.
  return 'denied'
}
