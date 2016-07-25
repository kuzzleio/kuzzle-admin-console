import kuzzle from '../../../services/kuzzle'
import q from 'q'
import { RECEIVE_MAPPING, RECEIVE_INDEXES_COLLECTIONS, ADD_NOTIFICATION, EMPTY_NOTIFICATION } from './mutation-types'
import { SET_ERROR } from '../common/mutation-types'

let room

export const listIndexesAndCollections = (store) => {
  let promises = []
  kuzzle
    .listIndexes((error, result) => {
      let indexesAndCollections = []

      if (error) {
        store.dispatch(SET_ERROR, error.message)
        return
      }

      result.forEach((index) => {
        let deferred = q.defer()

        promises.push(deferred.promise)
        kuzzle.listCollections(index, (error, result) => {
          if (error) {
            store.dispatch(SET_ERROR, error.message)
            return
          }
          if (index !== '%kuzzle') {
            indexesAndCollections.push({
              name: index,
              collections: result
            })
          }
          deferred.resolve(indexesAndCollections)
        })
      })
      q.all(promises).then(res => {
        store.dispatch(RECEIVE_INDEXES_COLLECTIONS, res[0])
      })
    })
}

export const getMapping = (store, index, collection) => {
  kuzzle.dataCollectionFactory(collection, index).getMapping((err, res) => {
    if (err) {
      store.dispatch(SET_ERROR, err.message)
      return
    }
    store.dispatch(RECEIVE_MAPPING, res.mapping)
  })
}

let notificationToMessage = notification => {
  var messageItem = {
    id: notification.result._id,
    text: '',
    icon: 'file',
    index: notification.index || '',
    collection: notification.collection || '',
    class: '',
    source: {
      source: JSON.stringify(notification.result._source, null, '\t'),
      metadata: notification.metadata
    },
    expanded: false,
    canEdit: true
  }

  switch (notification.action) {
    case 'publish':
      messageItem.text = 'Received volatile message'
      messageItem.icon = 'send'
      messageItem.class = 'message-volatile'
      messageItem.canEdit = false
      break
    case 'create':
    case 'createOrReplace':
      messageItem.icon = 'file'

      if (notification.state === 'done') {
        messageItem.text = 'Created new document'
        messageItem.class = 'message-created-updated-doc'
      } else if (notification.state === 'pending') {
        messageItem.text = 'Creating new document'
        messageItem.class = 'message-pending'
      }
      break

    case 'update':
      messageItem.text = 'Updated document'
      messageItem.icon = 'file'
      messageItem.class = 'message-created-updated-doc'
      break

    case 'delete':
      messageItem.icon = 'remove'
      messageItem.canEdit = false
      if (notification.state === 'done') {
        messageItem.text = 'Deleted document'
        messageItem.class = 'message-deleted-doc'
      } else if (notification.state === 'pending') {
        messageItem.text = 'Deleting document'
        messageItem.class = 'message-pending'
      }
      break

    case 'on':
      messageItem.text = 'A new user is listening to this room'
      messageItem.icon = 'user'
      messageItem.class = 'message-user'
      messageItem.canEdit = false
      messageItem.source = notification.metadata
      break

    case 'off':
      messageItem.text = 'A user exited this room'
      messageItem.icon = 'user'
      messageItem.class = 'message-user'
      messageItem.source = notification.metadata
      messageItem.canEdit = false
      break
  }

  messageItem.timestamp = notification.timestamp
  return messageItem
}

export const subscribe = (store, index, collection) => {
  room = kuzzle.dataCollectionFactory(collection, index).subscribe({}, {users: 'all', state: 'all'}, (err, res) => {
    if (err) {
      return
    }
    let notif = notificationToMessage(res)
    store.dispatch(ADD_NOTIFICATION, notif)
  })
}

export const unsubscribe = () => {
  room.unsubscribe()
}

export const clear = (store) => {
  store.dispatch(EMPTY_NOTIFICATION)
}
