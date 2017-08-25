import kuzzle from './kuzzle'
import Promise from 'bluebird'
import * as types from '../vuex/modules/auth/mutation-types'
import * as kuzzleTypes from '../vuex/modules/common/kuzzle/mutation-types'
import {SET_TOAST} from '../vuex/modules/common/toaster/mutation-types'

export const waitForConnected = (timeout = 1000) => {
  if (kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      // Timeout, if kuzzle doesn't respond in 1s (default) -> reject
      let timeoutId = setTimeout(() => {
        kuzzle.removeListener('connected', id)
        reject(new Error('Kuzzle does not respond'))
      }, timeout)

      let id = kuzzle.addListener('connected', () => {
        clearTimeout(timeoutId)
        kuzzle.removeListener('connected', id)
        resolve()
      })
    })
  }

  return Promise.resolve()
}

export const connectToEnvironment = (environment) => {
  // fix default port for users that have an old environment settings in their localStorage:
  if (environment.port === undefined) environment.port = 7512
  if (typeof environment.ssl !== 'boolean') environment.ssl = false

  if (kuzzle.state === 'connected') {
    kuzzle.disconnect()
  }

  kuzzle.host = environment.host
  kuzzle.port = environment.port
  kuzzle.sslConnection = environment.ssl
  kuzzle.connect()
}

export const initStoreWithKuzzle = (store) => {
  kuzzle.off('tokenExpired')
  kuzzle.off('queryError')
  kuzzle.off('networkError')
  kuzzle.off('connected')
  kuzzle.off('reconnected')
  kuzzle.off('discarded')

  kuzzle.on('queryError', (error) => {
    if (error && error.message) {
      switch (error.message) {
        case 'Token expired':
        case 'Invalid token':
        case 'Json Web Token Error':
          store.commit(types.SET_TOKEN_VALID, false)
          break
      }
    }
  })
  kuzzle.on('networkError', (error) => {
    store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, error)
  })
  kuzzle.on('connected', () => {
    store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, null)
  })
  kuzzle.on('reconnected', () => {
    store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, null)
    store.dispatch(kuzzleTypes.SWITCH_LAST_ENVIRONMENT)
  })
  kuzzle.on('discarded', function (data) {
    store.commit(SET_TOAST, {text: data.message})
  })
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
  constructor (content) {
    Object.keys(content).forEach(key => {
      this[key] = content[key]
    })
  }
}

/**
 * Constructor only used for displaying the constructor name in the list
 * JSON formatter (http://azimi.me/json-formatter-js/) check the constructor in order
 * to display the name https://github.com/mohsen1/json-formatter-js/blob/master/src/helpers.ts#L28
 */
class Meta {
  constructor (meta) {
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
  constructor (credentials) {
    Object.keys(credentials).forEach(key => {
      this[key] = credentials[key]
    })
  }
}

export const performSearchDocuments = (collection, index, filters = {}, pagination = {}, sort = []) => {
  if (!collection || !index) {
    return Promise.reject(new Error('Missing collection or index'))
  }

  return kuzzle
    .collection(collection, index)
    .searchPromise({...filters, sort}, {...pagination})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string' && sort[0] !== '_uid') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      const documents = result.documents.map((document) => {
        const object = {
          content: new Content(document.content),
          id: document.id,
          meta: new Meta(document.meta)
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
        }

        return object
      })

      return {documents, total: result.total}
    })
}

export const getMappingDocument = (collection, index) => {
  return kuzzle
    .collection(collection, index)
    .getMappingPromise()
}

export const performSearchUsers = (collection, index, filters = {}, pagination = {}, sort = []) => {
  let strategies
  return kuzzle
    .queryPromise({controller: 'auth', action: 'getStrategies'}, {})
    .then(res => {
      strategies = res.result

      return kuzzle
        .security
        .searchUsersPromise({...filters, sort}, {...pagination})
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
                value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
              }
            }

            strategies.forEach(strategy => {
              promises.push(kuzzle.security.getCredentialsPromise(strategy, document.id)
                .then(res => {
                  object.credentials[strategy] = res
                })
                .catch(() => {
                })
              )
            })
            users.push(object)
          })

          return Promise.all(promises).then(() => {
            return {documents: users, total: result.total}
          })
        })
    })
}

export const getMappingUsers = () => {
  return kuzzle
    .queryPromise({controller: 'security', action: 'getUserMapping'}, {})
    .then((res) => res.result)
}

export const updateMappingUsers = (newMapping) => {
  return kuzzle
    .queryPromise({controller: 'security', action: 'updateUserMapping'}, {
      body: {
        properties: newMapping
      }
    })
    .then(res => res.result)
}

export const performSearchProfiles = (filters = {}, pagination = {}) => {
  return kuzzle
    .security
    .searchProfilesPromise({...filters}, {...pagination})
    .then(result => {
      let profiles = result.profiles.map((document) => {
        let object = {
          content: document.content,
          meta: new Meta(document.meta || {}),
          id: document.id
        }

        return object
      })

      return {documents: profiles, total: result.total}
    })
}

export const getMappingProfiles = () => {
  return kuzzle
    .queryPromise({controller: 'security', action: 'getProfileMapping'}, {})
    .then((res) => res.result)
}

export const performSearchRoles = (controllers = {}, pagination = {}) => {
  return kuzzle
    .security
    .searchRolesPromise(controllers, {...pagination})
    .then(result => {
      let roles = result.roles.map((document) => {
        let object = {
          content: document.content,
          meta: new Meta(document.meta || {}),
          id: document.id
        }

        return object
      })

      return {documents: roles, total: result.total}
    })
}

export const getMappingRoles = () => {
  return kuzzle
    .queryPromise({controller: 'security', action: 'getRoleMapping'}, {})
    .then((res) => res.result)
}

export const performDeleteDocuments = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !index || !collection) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return kuzzle
      .queryPromise({controller: 'document', action: 'mDelete', collection, index}, {body: {ids}}, {refresh: 'wait_for'})
}

export const performDeleteUsers = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return kuzzle
    .queryPromise({controller: 'security', action: 'mDeleteUsers'}, {body: {ids}})
    .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
}

export const performDeleteRoles = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return kuzzle
    .queryPromise({controller: 'security', action: 'mDeleteRoles'}, {body: {ids}})
    .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
}

export const performDeleteProfiles = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return kuzzle
    .queryPromise({controller: 'security', action: 'mDeleteProfiles'}, {body: {ids}})
    .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
}
