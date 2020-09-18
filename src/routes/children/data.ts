export default [
  // Indexes routes
  {
    path: '/data',
    name: 'Indexes',
    component(resolve) {
      require(['../../components/Data/Indexes/Page'], resolve)
    }
  },
  {
    path: '/data/:indexName',
    name: 'Collections',
    meta: {
      auth: true
    },
    component(resolve) {
      require(['../../components/Data/Collections/CollectionList'], resolve)
    },
    props: route => ({
      indexName: route.params.indexName
    })
  },
  {
    path: '/data/:indexName/create',
    name: 'CreateCollection',
    component(resolve) {
      require(['../../components/Data/Collections/Create'], resolve)
    },
    props: route => ({
      indexName: route.params.indexName
    })
  },
  {
    path: '/data/:index/:collection/watch',
    name: 'WatchCollection',
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
    name: 'EditCollection',
    component(resolve) {
      require(['../../components/Data/Collections/Update'], resolve)
    },
    props: route => ({
      indexName: route.params.index,
      collectionName: route.params.collection
    })
  },
  {
    path: '/data/:index/:collection',
    name: 'DocumentList',
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
    name: 'CreateDocument',
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
    name: 'UpdateDocument',
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
