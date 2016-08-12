import kuzzle from './kuzzle'

export const isConnected = () => {
  if (kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      let id = kuzzle.addListener('connected', () => {
        kuzzle.removeListener('connected', id)
        resolve()
      })

      // Timeout, if kuzzle doesn't respond in 10s -> reject
      setTimeout(() => {
        kuzzle.removeListener('connected', id)
        reject()
      }, 10000)
    })
  }

  return Promise.resolve()
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
  if (!collection || !index) {
    return
  }
  return new Promise((resolve, reject) => {
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
