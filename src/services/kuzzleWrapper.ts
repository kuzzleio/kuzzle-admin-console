import { WebSocket } from 'kuzzle-sdk/dist/kuzzle'
import Promise from 'bluebird'
import Vue from 'vue'
import sortJson from 'sort-json'
import { get } from 'lodash'
import moment from 'moment'

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

/**
 * Constructor only used for displaying the constructor name in the list
 * JSON formatter (http://azimi.me/json-formatter-js/) check the constructor in order
 * to display the name https://github.com/mohsen1/json-formatter-js/blob/master/src/helpers.ts#L28
 */
class Content {
  constructor(content) {
    Object.keys(content).forEach(key => {
      if (key !== '_kuzzle_info') {
        this[key] = content[key]
      }
    })
  }
}

/**
 * Constructor only used for displaying the constructor name in the list
 * JSON formatter (http://azimi.me/json-formatter-js/) check the constructor in order
 * to display the name https://github.com/mohsen1/json-formatter-js/blob/master/src/helpers.ts#L28
 */
class Meta {
  constructor(_kuzzle_info) {
    if (!_kuzzle_info) {
      return
    }
    this['author'] =
      _kuzzle_info.author === '-1' ? 'Anonymous' : _kuzzle_info.author

    this['updater'] =
      _kuzzle_info.updater === '-1' ? 'Anonymous' : _kuzzle_info.updater

    if (_kuzzle_info.createdAt) {
      this['createdAt'] = `${moment(_kuzzle_info.createdAt).format(
        'YYYY-MM-DD HH:mm:ss'
      )} (${_kuzzle_info.createdAt})`
    }
    if (_kuzzle_info.updatedAt) {
      this['updatedAt'] = `${moment(_kuzzle_info.updatedAt).format(
        'YYYY-MM-DD HH:mm:ss'
      )} (${_kuzzle_info.updatedAt})`
    }
  }
}

/**
 * Constructor only used for displaying the constructor name in the list
 * JSON formatter (http://azimi.me/json-formatter-js/) check the constructor in order
 * to display the name https://github.com/mohsen1/json-formatter-js/blob/master/src/helpers.ts#L28
 */
class Credentials {
  constructor(credentials) {
    Object.keys(credentials).forEach(key => {
      this[key] = credentials[key]
    })
  }
}

/**
 * Constructor only used for displaying the constructor name in the list
 * JSON formatter (http://azimi.me/json-formatter-js/) check the constructor in order
 * to display the name https://github.com/mohsen1/json-formatter-js/blob/master/src/helpers.ts#L28
 */
class Aggregations {
  constructor(aggregations) {
    Object.keys(aggregations).forEach(key => {
      this[key] = aggregations[key]
    })
  }
}

interface IKuzzleDocument {
  content: Content
  id: string
  meta: Meta
  credentials: Credentials
  aggregations: Aggregations
  additionalAttribute: any
}

export const performSearchDocuments = async (
  collection,
  index,
  filters = {},
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
    { ...pagination, scroll: '1ms' }
  )

  let additionalAttributeName: any = null

  if (sort.length > 0) {
    if (typeof sort[0] === 'string' && sort[0] !== '_id') {
      additionalAttributeName = sort[0]
    } else {
      additionalAttributeName = Object.keys(sort[0])[0]
    }
  }

  const documents = result.hits.map(document => {
    const sorted = sortJson(document)
    const object: IKuzzleDocument = {
      content: new Content(sorted._source),
      id: document._id,
      meta: new Meta(get(sorted, '_source._kuzzle_info', {})),
      credentials: new Credentials({}),
      aggregations: new Aggregations({}),
      additionalAttribute: null
    }

    if (result.aggregations) {
      object.aggregations = new Aggregations(result.aggregations)
    }

    if (additionalAttributeName) {
      object.additionalAttribute = {
        name: additionalAttributeName,
        value: getValueAdditionalAttribute(
          sorted._source,
          additionalAttributeName.split('.')
        )
      }
    }

    return object
  })
  return { documents, total: result.total }
}

export const getMappingDocument = (collection, index) => {
  return Vue.prototype.$kuzzle.collection.getMapping(index, collection, {
    includeKuzzleMeta: true
  })
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
  let users: any = []

  if (sort.length > 0) {
    if (typeof sort[0] === 'string') {
      additionalAttributeName = sort[0]
    } else {
      additionalAttributeName = Object.keys(sort[0])[0]
    }
  }

  for (const document of result.hits) {
    let object: IKuzzleDocument = {
      content: new Content(document.content),
      id: document._id,
      credentials: new Credentials({}),
      meta: new Meta(document.meta || {}),
      aggregations: new Aggregations({}),
      additionalAttribute: null
    }

    if (result.aggregations) {
      object.aggregations = result.aggregations
    }

    if (additionalAttributeName) {
      object.additionalAttribute = {
        name: additionalAttributeName,
        value: getValueAdditionalAttribute(
          document.content,
          additionalAttributeName.split('.')
        )
      }
    }

    for (const strategy of strategies) {
      try {
        const res = await Vue.prototype.$kuzzle.security.getCredentials(
          strategy,
          document._id
        )
        object.credentials[strategy] = res
      } catch (e) {
        object.credentials[strategy] = {}
      }
    }
    users.push(object)
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
    return {
      content: { policies: document.policies },
      meta: new Meta(document.meta || {}),
      id: document._id
    }
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
    let object = {
      content: { controllers: document.controllers },
      meta: new Meta(document.meta || {}),
      id: document._id
    }

    return object
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
