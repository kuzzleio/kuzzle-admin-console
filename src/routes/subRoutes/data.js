import {
  canCreateCollection,
  canEditCollection,
  canCreateDocument,
  canEditDocument
} from '../../services/userAuthorization'

export default [
  // Indexes routes
  {
    path: '/data',
    name: 'DataIndexes',
    component (resolve) {
      require(['../../components/Data/Indexes/List'], resolve)
    }
  },
  {
    path: '/data/:index',
    name: 'DataIndexSummary',
    meta: {
      auth: true
    },
    component (resolve) {
      require(['../../components/Data/Collections/List'], resolve)
    }
  },
  {
    path: '/data/:index/create',
    name: 'DataCreateCollection',
    component (resolve) {
      if (!canCreateCollection()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Collections/Create'], resolve)
      }
    }
  },
  {
    path: '/data/:index/:collection/watch',
    name: 'DataCollectionWatch',
    component (resolve) {
      require(['../../components/Data/Collections/Watch'], resolve)
    }
  },
  {
    path: '/data/:index/:collection/edit',
    name: 'DataCollectionEdit',
    component (resolve) {
      if (!canEditCollection()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Collections/Update'], resolve)
      }
    }
  },
  {
    path: '/data/:index/:collection',
    name: 'DataDocumentsList',
    component (resolve) {
      require(['../../components/Data/Documents/List'], resolve)
    }
  },
  {
    path: '/data/:index/:collection/create',
    name: 'DataCreateDocument',
    component (resolve) {
      if (!canCreateDocument()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Documents/Create'], resolve)
      }
    }
  },
  {
    path: '/data/:index/:collection/update/:id',
    name: 'DataUpdateDocument',
    component (resolve) {
      if (!canEditDocument()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Data/Documents/Update'], resolve)
      }
    }
  }
]
