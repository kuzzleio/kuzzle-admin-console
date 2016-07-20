export default {
  '/:index': {
    name: 'DataIndex',
    component (resolve) {
      require(['../../components/Data/Layout'], resolve)
    }
  },
  '/:index/:collection': {
    name: 'DataIndexCollection',
    component (resolve) {
      require(['../../components/Data/Collection'], resolve)
    },
    subRoutes: {
      '/summary': {
        name: 'SummaryData',
        component (resolve) {
          require(['../../components/Data/Summary/Layout'], resolve)
        }
      }
    }
  }
}
