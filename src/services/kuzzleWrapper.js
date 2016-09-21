import kuzzle from './kuzzle'
import { setTokenValid } from '../vuex/modules/auth/actions'
import { setKuzzleHostPort } from '../vuex/modules/common/kuzzle/actions'
import Promise from 'bluebird'

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
  console.log('disconnecting kuzzle...') 
  if (kuzzle.state === 'connected') {
    kuzzle.disconnect()    
  }
  kuzzle.host = environment.host
  kuzzle.ioPort = environment.ioPort
  kuzzle.wsPort = environment.wsPort
  console.log('connecting kuzzle...') 
  kuzzle.connect()
}

export const initStoreWithKuzzle = (store) => {
  setKuzzleHostPort(store, kuzzle.host, kuzzle.wsPort)

  kuzzle.removeAllListeners('jwtTokenExpired')
  kuzzle.addListener('jwtTokenExpired', () => {
    setTokenValid(store, false)
  })

  // kuzzle.removeAllListeners('disconnected')
  // kuzzle.addListener('disconnected', () => {
  //   setConnection(store, null)
  // })

  // kuzzle.removeAllListeners('reconnected')
  // kuzzle.addListener('reconnected', () => {
  //   setConnection(store, )
  // })
}

// Helper for performSearch
let getValueAdditionalAttribute = (content, attributePath) => {
  let attribute = attributePath.shift()

  if (typeof content[attribute] === 'object') {
    return getValueAdditionalAttribute(content[attribute], attributePath)
  }

  return content[attribute]
}

export const performSearch = (collection, index, filters = {}, pagination = {}, sort = []) => {
  return new Promise((resolve, reject) => {
    if (!collection || !index) {
      return reject(new Error('Missing collection or index'))
    }

    kuzzle
      .dataCollectionFactory(collection, index)
      .advancedSearch({...filters, ...pagination, sort}, (error, result) => {
        if (error) {
          return reject(error)
        }

        let additionalAttributeName = null

        if (sort.length > 0) {
          if (typeof sort[0] === 'string') {
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
        resolve({documents: documents, total: result.total})
      })
  })
}

export const deleteDocuments = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !index || !collection) {
    return
  }

  return new Promise((resolve, reject) => {
    kuzzle
      .dataCollectionFactory(collection, index)
      .deleteDocument({filter: {ids: {values: ids}}}, (error) => {
        if (error) {
          reject(error)
          return
        }

        kuzzle.refreshIndex(index, () => {
          resolve()
        })
      })
  })
}
