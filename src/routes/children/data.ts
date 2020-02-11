export default [
  // Indexes routes
  {
    path: '/data',
    name: 'Data',
    component(resolve) {
      require(['../../components/Data/Indexes/Page'], resolve)
    }
  },
  {
    path: '/data/:index',
    name: 'DataIndexSummary',
    meta: {
      auth: true
    },
    component(resolve) {
      require(['../../components/Data/Collections/List'], resolve)
    },
    props: route => ({
      index: route.params.index
    })
  },
  {
    path: '/data/:index/create',
    name: 'DataCreateCollection',
    component(resolve) {
      require(['../../components/Data/Collections/Create'], resolve)
    },
    props: route => ({
      index: route.params.index
    })
  },
  {
    path: '/data/:index/:collection/watch',
    name: 'DataCollectionWatch',
    component(resolve) {
      require(['../../components/Data/Collections/Watch'], resolve)
    },
    props: route => ({
      index: route.params.index,
      collection: route.params.collection
    })
  },
  {
    path: '/data/:index/:collection/edit',
    name: 'DataCollectionEdit',
    component(resolve) {
      require(['../../components/Data/Collections/Update'], resolve)
    },
    props: route => ({
      index: route.params.index,
      collection: route.params.collection
    })
  },
  {
    path: '/data/:index/:collection',
    name: 'DataDocumentsList',
    component(resolve) {
      require(['../../components/Data/Documents/Page'], resolve)
    },
    props: route => ({
      index: route.params.index,
      collection: route.params.collection
    })
  },
  {
    path: '/data/:index/:collection/create',
    name: 'DataCreateDocument',
    component(resolve) {
      require(['../../components/Data/Documents/Create'], resolve)
    },
    props: route => ({
      index: route.params.index,
      collection: route.params.collection
    })
  },
  {
    path: '/data/:index/:collection/update/:id',
    name: 'DataUpdateDocument',
    component(resolve) {
      require(['../../components/Data/Documents/Update'], resolve)
    },
    props: route => ({
      id: route.params.id,
      index: route.params.index,
      collection: route.params.collection
    })
  }
]
