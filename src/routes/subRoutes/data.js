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
    }
  },
  '/:index/:collection': {
    name: 'DataIndexCollection',
    component (resolve) {
      require(['../../components/Data/Collection'], resolve)
    },
    subRoutes: {
      '/watch': {
        name: 'WatchData',
        component (resolve) {
          require(['../../components/Data/Watch/Layout'], resolve)
        }
      }
    }
  }
}
