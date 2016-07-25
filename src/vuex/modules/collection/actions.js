import {
  TOGGLE_SELECT_DOCUMENT,
  RECEIVE_DOCUMENTS
} from './mutation-types'

import kuzzle from '../../../services/kuzzle'

export const toggleSelectDocuments = (store, id) => {
  if (!id) {
    return
  }

  store.dispatch(TOGGLE_SELECT_DOCUMENT, id)
}

export const performSearch = (store, collection, index, filters = {}, pagination = {}, sort = []) => {
  if (!collection || !index) {
    return
  }

  kuzzle
    .dataCollectionFactory(collection, index)
    .advancedSearch({...filters, ...pagination, sort}, (error, result) => {
      if (error) {
        return
      }

      let additionalAttributeName = null

      if (sort.length > 0) {
        additionalAttributeName = Object.keys(sort[0])[0]
      }

      let documents = result.documents.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {name: additionalAttributeName, value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))}
        }

        return object
      })

      store.dispatch(RECEIVE_DOCUMENTS, {total: result.total, documents})
    })
}

let getValueAdditionalAttribute = (content, attributePath) => {
  let attribute = attributePath.shift()

  if (typeof content[attribute] === 'object') {
    return getValueAdditionalAttribute(content[attribute], attributePath)
  }

  return content[attribute]
}
