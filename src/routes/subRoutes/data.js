export default {
  '/': {
    name: 'DataIndexes',
    component (resolve) {
      require(['../../components/Data/Indexes/Browse'], resolve)
    }
  },
  '/:index': {
    name: 'DataIndex',
    component (resolve) {
      require(['../../components/Data/Indexes/Summary'], resolve)
    },
    subRoutes: {
      '/create': {
        name: 'CreateCollection',
        component (resolve) {
          require(['../../components/Data/Collection/Create'], resolve)
        }
      }
    }
  },
  '/:index/:collection': {
    name: 'DataIndexCollection',
    component (resolve) {
      require(['../../components/Data/Collection'], resolve)
    }
  }
}
