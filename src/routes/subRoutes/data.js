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
    }
  },
  '/index/:index': {
    name: 'Index',
    component (resolve) {
      require(['../../components/Data/Index/Layout'], resolve)
    },
    subRoutes: {
      '/create': {
        name: 'CreateCollection',
        component (resolve) {
          require(['../../components/Data/Index/CreateCollection'], resolve)
        }
      }
    }
  }
}
