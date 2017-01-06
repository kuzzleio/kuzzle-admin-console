const kuzzleWrapperInjector = require('inject!../../../../src/services/kuzzleWrapper')

let sandbox = sinon.sandbox.create()

describe('Kuzzle wrapper service', () => {
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
              search (filters, cb) {
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

    it('should reject a promise as there is no collection nor index', (done) => {
      kuzzleWrapper.performSearch()
        .then(() => {})
        .catch(err => {
          expect(err.message).to.equals('Missing collection or index')
          done()
        })
    })

    it('should reject a promise', (done) => {
      kuzzleWrapper.performSearch('collection', 'index')
        .then(() => {})
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
        .catch((e) => done(e))
    })

    it('should receive sorted documents with additional attributes for the sort array', (done) => {
      triggerError = false
      kuzzleWrapper.performSearch('collection', 'index', {}, {}, [{'name.first': 'asc'}])
        .then(res => {
          expect(res).to.deep.equals(responseWithAdditionalAttr)
          done()
        }).catch(() => {})
    })

    it('should treat a String sort argument as the field to sort by', (done) => {
      triggerError = false
      kuzzleWrapper.performSearch('collection', 'index', {}, {}, ['name.first'])
        .then(res => {
          expect(res).to.deep.equals(responseWithAdditionalAttr)
          done()
        }).catch(() => {})
    })
  })

  describe('connectToEnvironment', () => {
    let kuzzleWrapper
    let disconnectMock = sandbox.mock()
    let connectMock = sandbox.mock()

    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          disconnect: disconnectMock,
          connect: connectMock,
          state: 'connected'
        }
      })
    })

    it('should disconnect and reconnect kuzzle after setting the environment params', () => {
      kuzzleWrapper.connectToEnvironment({host: 'toto.toto', ioPort: 7512, wsPort: 7513})

      expect(disconnectMock.called).to.equals(true)
      expect(connectMock.called).to.equals(true)
    })
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
        .then(() => {})
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

  describe('waitForConnected', () => {
    let kuzzleWrapper
    let removeListener = sandbox.stub()

    it('should resolve if kuzzle is connected', (done) => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          state: 'connected'
        }
      })

      kuzzleWrapper.waitForConnected()
        .then(() => done())
        .catch(e => done(e))
    })

    it('should resolve if kuzzle trigger event connected', (done) => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          state: 'connecting',
          addListener (event, cb) {
            cb()
          },
          removeListener
        }
      })

      kuzzleWrapper.waitForConnected()
        .then(() => {
          expect(removeListener.called).to.be.equal(true)
          done()
        })
        .catch(e => done(e))
    })

    it('should reject if kuzzle never trigger event connected', (done) => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          state: 'connecting',
          addListener: sandbox.stub(),
          removeListener
        }
      })

      kuzzleWrapper.waitForConnected(10)
        .then(() => {
          done(new Error('Promise was resolved'))
        })
        .catch(() => done())
    })
  })

  describe('initStoreWithKuzzle', () => {
    let kuzzleWrapper
    let removeAllListeners = sandbox.stub()
    let setTokenValid = sandbox.stub()

    it('should call removeListeners and addListeners with right params', () => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          host: 'toto',
          wsPort: 8888,
          state: 'connecting',
          addListener (event, cb) {
            cb()
          },
          removeAllListeners
        }
      })

      let store = { store: 'mystore' }
      kuzzleWrapper.initStoreWithKuzzle(store)

      expect(removeAllListeners.calledWith('queryError'))
      expect(setTokenValid.calledWithMatch(store, false))
    })
  })
})

