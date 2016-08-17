export default {
  // Indexes routes
  '/': {
    name: 'DataIndexes',
    component (resolve) {
      require(['../../components/Data/Indexes/Browse'], resolve)
    }
  },
  '/:index': {
    name: 'DataIndexSummary',
    component (resolve) {
      require(['../../components/Data/Indexes/Summary'], resolve)
    }
  },
  '/:index/create': {
    name: 'DataCreateCollection',
    component (resolve) {
      require(['../../components/Data/Collections/Create'], resolve)
    }
  },
  // Collections routes
  '/:index/:collection': {
    name: 'DataCollectionBrowse',
    component (resolve) {
      require(['../../components/Data/Collections/Browse'], resolve)
    }
  },
  '/:index/:collection/summary': {
    name: 'DataCollectionSummary',
    component (resolve) {
      require(['../../components/Data/Collections/Summary'], resolve)
    }
  },
  '/:index/:collection/watch': {
    name: 'DataCollectionWatch',
    component (resolve) {
      require(['../../components/Data/Collections/Watch'], resolve)
    }
  },
  // Documents routes
  '/:index/:collection/create': {
    name: 'DataCreateDocument',
    component (resolve) {
      require(['../../components/Data/Documents/Create'], resolve)
    }
  },
  '/:index/:collection/:document': {
    name: 'DataDocumentDetail',
    component (resolve) {
      require(['../../components/Data/Documents/Detail'], resolve)
    }
  },
  '/:index/:collection/:document/edit': {
    name: 'DataDocumentEdit',
    component (resolve) {
      require(['../../components/Data/Documents/Create'], resolve)
    }
  }
}
