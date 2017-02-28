import kuzzle from './kuzzle'
import Promise from 'bluebird'
import * as types from '../vuex/modules/auth/mutation-types'
import * as kuzzleTypes from '../vuex/modules/common/kuzzle/mutation-types'

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
  kuzzle.removeAllListeners('jwtTokenExpired')
  kuzzle.removeAllListeners('queryError')
  kuzzle.addListener('queryError', (error) => {
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
  kuzzle.removeAllListeners('error')
  kuzzle.addListener('error', () => {
    if (!store.state.kuzzle.errorFromKuzzle) {
      store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, true)
    }
  })
  kuzzle.addListener('connected', () => {
    store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, false)
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

export const performSearchDocuments = (collection, index, filters = {}, pagination = {}, sort = []) => {
  if (!collection || !index) {
    return Promise.reject(new Error('Missing collection or index'))
  }

  return kuzzle
    .collection(collection, index)
    .searchPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string' && sort[0] !== '_uid') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let documents = result.documents.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
        }

        return object
      })

      return {documents: documents, total: result.total}
    })
}

export const getMappingDocument = (collection, index) => {
  return kuzzle
    .collection(collection, index)
    .getMappingPromise()
}

export const performSearchUsers = (collection, index, filters = {}, pagination = {}, sort = []) => {
  return kuzzle
    .security
    .searchUsersPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let users = result.users.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
        }

        return object
      })

      return {documents: users, total: result.total}
    })
}

export const getMappingUsers = () => {
  return kuzzle
    .queryPromise({controller: 'security', action: 'getUserMapping'}, {})
    .then((res) => res.result)
}

export const performSearchProfiles = (collection, index, filters = {}, pagination = {}, sort = []) => {
  return kuzzle
    .security
    .searchProfilesPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let profiles = result.profiles.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
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

export const performSearchRoles = (collection, index, filters = {}, pagination = {}, sort = []) => {
  return kuzzle
    .security
    .searchRolesPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let roles = result.roles.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
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
      .queryPromise({controller: 'document', action: 'mDelete', collection, index}, {body: {ids}})
      .then(() => kuzzle.refreshIndex(index))
}

export const performDeleteUsers = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('ids<Array> parameter is required'))
  }

  return kuzzle
    .queryPromise({controller: 'security', action: 'mDeleteUsers'}, {body: {ids}})
    .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
}

export const performDeleteRoles = (index, collection, ids) => {
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
