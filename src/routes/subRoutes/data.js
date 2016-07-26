export default {
  '/': {
    name: 'DataIndexes',
    component (resolve) {
      require(['../../components/Data/Indexes/List'], resolve)
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
    }
  }
}
