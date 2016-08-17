const kuzzleWrapperInjector = require('inject!../../../../src/services/kuzzleWrapper')

describe('performSearch tests', () => {
  let triggerError = true
  let fakeResponse = {
    total: 42,
    documents: [{
      content: {
        name: {
          first: 'toto'
        }
      },
      id: 'id'
    }]
  }
  let responseWithAdditionalAttr = {
    documents: [{
      content: {name: {first: 'toto'}},
      id: 'id',
      additionalAttribute: {name: 'name.first', value: 'toto'}
    }],
    total: 42
  }
  let kuzzleWrapper

  beforeEach(() => {
    kuzzleWrapper = kuzzleWrapperInjector({
      './kuzzle': {
        dataCollectionFactory () {
          return {
            advancedSearch (filters, cb) {
              if (triggerError) {
                cb(new Error('error'))
              } else {
                cb(null, fakeResponse)
              }
            }
          }
        }
      }
    })
  })

  it('should do nothing as there is no collection nor index', () => {
    kuzzleWrapper.performSearch()
  })

  it('should reject a promise', (done) => {
    kuzzleWrapper.performSearch('collection', 'index')
      .then(() => {

      })
      .catch(e => {
        expect(e.message).to.equals('error')
        done()
      })
  })

  it('should receive documents', (done) => {
    triggerError = false
    kuzzleWrapper.performSearch('collection', 'index')
      .then(res => {
        expect(res).to.deep.equals(fakeResponse)
        done()
      })
  })

  it('should receive sorted documents with additional attributes for the sort array', (done) => {
    triggerError = false
    kuzzleWrapper.performSearch('collection', 'index', {}, {}, [{'name.first': 'asc'}])
      .then(res => {
        expect(res).to.deep.equals(responseWithAdditionalAttr)
        done()
      })
  })
  //
  // it('should receive sorted documents with additional attributes for the sort string', (done) => {
  //   triggerError = false
  //   testActionPromise(kuzzleWrapper.performSearch, ['fake', 'fake', {}, {}, ['name.first']], {}, [], done)
  // })
})

describe('deleteDocuments tests', () => {
  let triggerError = true
  let kuzzleWrapper

  beforeEach(() => {
    kuzzleWrapper = kuzzleWrapperInjector({
      './kuzzle': {
        dataCollectionFactory () {
          return {
            deleteDocument (filters, cb) {
              if (triggerError) {
                cb(new Error('error'))
              } else {
                cb(null)
              }
            }
          }
        },
        refreshIndex (index, cb) {
          cb()
        }
      }
    })
  })

  it('should do nothing if there is no ids nor index and collection', () => {
    kuzzleWrapper.deleteDocuments()
  })

  it('should reject a promise', (done) => {
    kuzzleWrapper.deleteDocuments('index', 'collection', [42])
      .then(() => {

      })
      .catch(e => {
        expect(e.message).to.equals('error')
        done()
      })
  })

  it('should delete a document and refresh the index, then resolve a promise', (done) => {
    triggerError = false
    kuzzleWrapper.deleteDocuments('index', 'collection', [42])
      .then(() => {
        done()
      })
  })
})
