import {
  TOGGLE_SELECT_DOCUMENT,
  RECEIVE_DOCUMENTS,
  SET_BASIC_FILTER
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
          object.additionalAttribute = {name: additionalAttributeName, value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))}
        }

        return object
      })
      store.dispatch(RECEIVE_DOCUMENTS, {total: result.total, documents})
    })
}

export const setBasicFilter = (store, basicFilter) => {
  store.dispatch(SET_BASIC_FILTER, basicFilter)
}

let getValueAdditionalAttribute = (content, attributePath) => {
  let attribute = attributePath.shift()

  if (typeof content[attribute] === 'object') {
    return getValueAdditionalAttribute(content[attribute], attributePath)
  }

  return content[attribute]
}

