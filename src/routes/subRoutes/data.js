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
      require(['../../components/Data/Collections/CreateOrUpdate'], resolve)
    }
  },
  '/:index/:collection/watch': {
    name: 'DataCollectionWatch',
    component (resolve) {
      require(['../../components/Data/Collections/Watch'], resolve)
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
      require(['../../components/Data/Documents/CreateOrUpdate'], resolve)
    }
  },
  '/:index/:collection/:id': {
    name: 'DataDocumentDetail',
    component (resolve) {
      require(['../../components/Data/Documents/CreateOrUpdate'], resolve)
    }
  }
}
