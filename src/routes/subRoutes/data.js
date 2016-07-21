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
    }
  }
}
