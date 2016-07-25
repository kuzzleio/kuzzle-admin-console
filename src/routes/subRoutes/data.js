export default {
  // '/:index': {
  //   name: 'DataIndex',
  //   component (resolve) {
  //     require(['../../components/Data/Index'], resolve)
  //   }
  // },
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
