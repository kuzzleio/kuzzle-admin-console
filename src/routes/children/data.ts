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
    path: '/data/:indexName/:collectionName/watch',
    name: 'WatchCollection',
    component(resolve) {
      require(['../../components/Data/Collections/Watch'], resolve)
    },
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName/edit',
    name: 'EditCollection',
    component(resolve) {
      require(['../../components/Data/Collections/Update'], resolve)
    },
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName',
    name: 'DocumentList',
    component(resolve) {
      require(['../../components/Data/Documents/Page'], resolve)
    },
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName/create',
    name: 'CreateDocument',
    component(resolve) {
      require(['../../components/Data/Documents/Create'], resolve)
    },
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName/update/:id',
    name: 'UpdateDocument',
    component(resolve) {
      require(['../../components/Data/Documents/Update'], resolve)
    },
    props: route => ({
      id: route.params.id,
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  }
]
