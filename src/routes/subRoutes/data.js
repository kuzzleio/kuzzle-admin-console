export default {
  // Indexes routes
  '/': {
    name: 'DataIndexes',
    component (resolve) {
      require(['../../components/Data/Indexes/Browse'], resolve)
    }
  },
  '/data/:index': {
    name: 'DataIndexSummary',
    component (resolve) {
      require(['../../components/Data/Indexes/Summary'], resolve)
    }
  },
  '/data/:index/create': {
    name: 'DataCreateCollection',
    component (resolve) {
      require(['../../components/Data/Collections/Create'], resolve)
    }
  },
  // Collections routes
  '/data/:index/:collection': {
    name: 'DataCollectionBrowse',
    component (resolve) {
      require(['../../components/Data/Collections/Browse'], resolve)
    }
  },
  '/data/:index/:collection/summary': {
    name: 'DataCollectionSummary',
    component (resolve) {
      require(['../../components/Data/Collections/Summary'], resolve)
    }
  },
  '/data/:index/:collection/watch': {
    name: 'DataCollectionWatch',
    component (resolve) {
      require(['../../components/Data/Collections/Watch'], resolve)
    }
  },
  // Documents routes
  '/data/:index/:collection/create': {
    name: 'DataCreateDocument',
    component (resolve) {
      require(['../../components/Data/Documents/Create'], resolve)
    }
  },
  '/data/:index/:collection/:document': {
    name: 'DataDocumentDetail',
    component (resolve) {
      require(['../../components/Data/Documents/Detail'], resolve)
    }
  },
  '/data/:index/:collection/:document/edit': {
    name: 'DataDocumentEdit',
    component (resolve) {
      require(['../../components/Data/Documents/Create'], resolve)
    }
  }
}
