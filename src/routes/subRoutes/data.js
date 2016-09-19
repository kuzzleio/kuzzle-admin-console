import {
  canCreateCollection,
  canEditCollection,
  canCreateDocument,
  canEditDocument
} from '../../services/userAuthorization'

export default {
  // Indexes routes
  '/': {
    name: 'DataIndexes',
    component (resolve) {
      require(['../../components/Data/Indexes/List'], resolve)
    }
  },
  '/:index': {
    name: 'DataIndexSummary',
    component (resolve) {
      require(['../../components/Data/Collections/List'], resolve)
    }
  },
  '/:index/create': {
    name: 'DataCreateCollection',
    component (resolve) {
      if (!canCreateCollection()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Collections/Create'], resolve)
      }
    }
  },
  '/:index/:collection/watch': {
    name: 'DataCollectionWatch',
    component (resolve) {
      require(['../../components/Data/Collections/Watch'], resolve)
    }
  },
  '/:index/:collection/edit': {
    name: 'DataCollectionEdit',
    component (resolve) {
      if (!canEditCollection()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Collections/Update'], resolve)
      }
    }
  },
  '/:index/:collection': {
    name: 'DataDocumentsList',
    component (resolve) {
      require(['../../components/Data/Documents/List'], resolve)
    }
  },
  '/:index/:collection/create': {
    name: 'DataCreateDocument',
    component (resolve) {
      if (!canCreateDocument()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Documents/Create'], resolve)
      }
    }
  },
  '/:index/:collection/update/:id': {
    name: 'DataUpdateDocument',
    component (resolve) {
      if (!canEditDocument()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Documents/Update'], resolve)
      }
    }
  }
}
