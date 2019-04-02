import {WebSocket} from 'kuzzle-sdk/dist/kuzzle'
import Promise from 'bluebird'
import Vue from 'vue'

export const waitForConnected = (timeout = 1000) => {
  if (Vue.prototype.$kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      // Timeout, if kuzzle doesn't respond in 1s (default) -> reject
      let timeoutId = setTimeout(() => {
        Vue.prototype.$kuzzle.removeListener('connected', id)
        reject(new Error('Kuzzle does not respond'))
      }, timeout)

      let id = Vue.prototype.$kuzzle.addListener('connected', () => {
        clearTimeout(timeoutId)
        Vue.prototype.$kuzzle.removeListener('connected', id)
        resolve()
      })
    })
  }

  return Promise.resolve()
}

export const connectToEnvironment = environment => {
  // fix default port for users that have an old environment settings in their localStorage:
  if (environment.port === undefined) environment.port = 7512
  if (typeof environment.ssl !== 'boolean') environment.ssl = false

  if (Vue.prototype.$kuzzle.state === 'connected') {
    Vue.prototype.$kuzzle.disconnect()
  }

  Vue.prototype.$kuzzle.protocol = new WebSocket(environment.host, {
    port: environment.port,
    sslConnection: environment.ssl
  })
  Vue.prototype.$kuzzle.connect()
}

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
  constructor(meta) {
    Object.keys(meta).forEach(key => {
      this[key] = meta[key]
    })
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

export const performSearchDocuments = async (
  collection,
  index,
  filters = {},
  pagination = {},
  sort = []
) => {
  if (!collection || !index) {
    throw new Error('Missong collection or index')
  }

  const result = await Vue.prototype.$kuzzle
    .document
    .search(index, collection, { ...filters, sort }, { ...pagination })

  let additionalAttributeName = null

  if (sort.length > 0) {
    if (typeof sort[0] === 'string' && sort[0] !== '_uid') {
      additionalAttributeName = sort[0]
    } else {
      additionalAttributeName = Object.keys(sort[0])[0]
    }
  }

  const documents = result.hits.map(document => {
    const object = {
      content: new Content(document._source),
      id: document._id,
      meta: new Meta(document._meta)
    }

    if (additionalAttributeName) {
      object.additionalAttribute = {
        name: additionalAttributeName,
        value: getValueAdditionalAttribute(
          document._source,
          additionalAttributeName.split('.')
        )
      }
    }

    return object
  })
  return { documents, total: result.total }
}

export const getMappingDocument = (collection, index) => {
  return Vue.prototype.$kuzzle.collection.getMapping(index, collection)
}

export const performSearchUsers = (
  collection,
  index,
  filters = {},
  pagination = {},
  sort = []
) => {
  let strategies
  return Vue.prototype.$kuzzle
    .queryPromise({ controller: 'auth', action: 'getStrategies' }, {})
    .then(res => {
      strategies = res.result

      return Vue.prototype.$kuzzle.security
        .searchUsersPromise({ ...filters, sort }, { ...pagination })
        .then(result => {
          let additionalAttributeName = null
          let users = []
          const promises = []

          if (sort.length > 0) {
            if (typeof sort[0] === 'string') {
              additionalAttributeName = sort[0]
            } else {
              additionalAttributeName = Object.keys(sort[0])[0]
            }
          }

          result.users.forEach(document => {
            let object = {
              content: new Content(document.content),
              id: document.id,
              credentials: new Credentials({}),
              meta: new Meta(document.meta || {})
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

            strategies.forEach(strategy => {
              promises.push(
                Vue.prototype.$kuzzle.security
                  .getCredentialsPromise(strategy, document.id)
                  .then(res => {
                    object.credentials[strategy] = res
                  })
                  .catch(() => {})
              )
            })
            users.push(object)
          })

          return Promise.all(promises).then(() => {
            return { documents: users, total: result.total }
          })
        })
    })
}

export const getMappingUsers = () => {
  return Vue.prototype.$kuzzle
    .queryPromise({ controller: 'security', action: 'getUserMapping' }, {})
    .then(res => res.result)
}

export const updateMappingUsers = newMapping => {
  return Vue.prototype.$kuzzle
    .queryPromise(
      { controller: 'security', action: 'updateUserMapping' },
      {
        body: {
          properties: newMapping
        }
      }
    )
    .then(res => res.result)
}

export const performSearchProfiles = (filters = {}, pagination = {}) => {
  return Vue.prototype.$kuzzle.security
    .searchProfilesPromise({ ...filters }, { size: 100, ...pagination })
    .then(result => {
      let profiles = result.profiles.map(document => {
        let object = {
          content: document.content,
          meta: new Meta(document.meta || {}),
          id: document.id
        }

        return object
      })

      return { documents: profiles, total: result.total }
    })
}

export const getMappingProfiles = () => {
  return Vue.prototype.$kuzzle
    .queryPromise({ controller: 'security', action: 'getProfileMapping' }, {})
    .then(res => res.result)
}

export const performSearchRoles = (controllers = {}, pagination = {}) => {
  return Vue.prototype.$kuzzle.security
    .searchRolesPromise(controllers, { ...pagination })
    .then(result => {
      let roles = result.roles.map(document => {
        let object = {
          content: document.content,
          meta: new Meta(document.meta || {}),
          id: document.id
        }

        return object
      })

      return { documents: roles, total: result.total }
    })
}

export const getMappingRoles = () => {
  return Vue.prototype.$kuzzle
    .queryPromise({ controller: 'security', action: 'getRoleMapping' }, {})
    .then(res => res.result)
}

export const performDeleteDocuments = (index, collection, ids) => {
  if (
    !ids ||
    !Array.isArray(ids) ||
    ids.length === 0 ||
    !index ||
    !collection
  ) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return Vue.prototype.$kuzzle.query(
    { controller: 'document', action: 'mDelete', collection, index, body: { ids }, refresh: 'wait_for' })
}

export const performDeleteUsers = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return Vue.prototype.$kuzzle
    .queryPromise(
      { controller: 'security', action: 'mDeleteUsers' },
      { body: { ids } }
    )
    .then(() =>
      Vue.prototype.$kuzzle.queryPromise(
        { controller: 'index', action: 'refreshInternal' },
        {}
      )
    )
}

export const performDeleteRoles = ids => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return Vue.prototype.$kuzzle
    .queryPromise(
      { controller: 'security', action: 'mDeleteRoles' },
      { body: { ids } }
    )
    .then(() =>
      Vue.prototype.$kuzzle.queryPromise(
        { controller: 'index', action: 'refreshInternal' },
        {}
      )
    )
}

export const performDeleteProfiles = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return Vue.prototype.$kuzzle
    .queryPromise(
      { controller: 'security', action: 'mDeleteProfiles' },
      { body: { ids } }
    )
    .then(() =>
      Vue.prototype.$kuzzle.queryPromise(
        { controller: 'index', action: 'refreshInternal' },
        {}
      )
    )
}

export const isKuzzleActionAllowed = (rights, controller, action, index, collection) => {
  var filteredRights

  if (!rights || typeof rights !== 'object') {
    throw new Error('rights parameter is mandatory for isActionAllowed function')
  }
  if (!controller || typeof controller !== 'string') {
    throw new Error('controller parameter is mandatory for isActionAllowed function')
  }
  if (!action || typeof action !== 'string') {
    throw new Error('action parameter is mandatory for isActionAllowed function')
  }

  // We filter in all the rights that match the request (including wildcards).
  filteredRights = rights
    .filter(function (right) {
      return right.controller === controller || right.controller === '*'
    })
    .filter(function (right) {
      return right.action === action || right.action === '*'
    })
    .filter(function (right) {
      return right.index === index || right.index === '*'
    })
    .filter(function (right) {
      return right.collection === collection || right.collection === '*'
    })

  // Then, if at least one right allows the action, we return 'allowed'
  if (filteredRights.some(function (item) { return item.value === 'allowed' })) {
    return 'allowed'
  }
  // If no right allows the action, we check for conditionals.
  if (filteredRights.some(function (item) { return item.value === 'conditional' })) {
    return 'conditional'
  }
  // Otherwise we return 'denied'.
  return 'denied'
}
