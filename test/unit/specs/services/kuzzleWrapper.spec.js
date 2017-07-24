const kuzzleWrapperInjector = require('inject-loader!../../../../src/services/kuzzleWrapper')

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
        id: 'id',
        meta: {
          createdAt: 10101101
        }
      }]
    }
    let responseWithAdditionalAttr = {
      documents: [{
        content: {name: {first: 'toto'}},
        id: 'id',
        additionalAttribute: {name: 'name.first', value: 'toto'},
        meta: {
          createdAt: 10101101
        }
      }],
      total: 42
    }
    let kuzzleWrapper

    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          collection () {
            return {
              search (filters, cb) {
                if (triggerError) {
                  cb(new Error('error'))
                } else {
                  cb(null, fakeResponse)
                }
              },
              searchPromise () {
                return new Promise((resolve, reject) => {
                  if (triggerError) {
                    reject(new Error('error'))
                  } else {
                    resolve(fakeResponse)
                  }
                })
              }
            }
          }
        }
      })
    })

    it('should reject a promise as there is no collection nor index', (done) => {
      kuzzleWrapper.performSearchDocuments()
        .then(() => {})
        .catch(err => {
          expect(err.message).to.equals('Missing collection or index')
          done()
        })
    })

    it('should reject a promise', (done) => {
      kuzzleWrapper.performSearchDocuments('collection', 'index')
        .then(() => {})
        .catch(e => {
          expect(e.message).to.equals('error')
          done()
        })
    })

    it('should receive documents', (done) => {
      triggerError = false
      kuzzleWrapper.performSearchDocuments('collection', 'index')
        .then(res => {
          expect(res).to.deep.equals(fakeResponse)
          done()
        })
        .catch((e) => done(e))
    })

    it('should receive sorted documents with additional attributes for the sort array', (done) => {
      triggerError = false
      kuzzleWrapper.performSearchDocuments('collection', 'index', {}, {}, [{'name.first': 'asc'}])
        .then(res => {
          expect(res).to.deep.equals(responseWithAdditionalAttr)
          done()
        }).catch(() => {})
    })

    it('should treat a String sort argument as the field to sort by', (done) => {
      triggerError = false
      kuzzleWrapper.performSearchDocuments('collection', 'index', {}, {}, ['name.first'])
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
      kuzzleWrapper.connectToEnvironment({host: 'toto.toto', port: 7512})

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
          queryPromise () {
            if (triggerError) {
              return Promise.reject(new Error('error'))
            } else {
              return Promise.resolve()
            }
          },
          refreshIndex (index) {
            return Promise.resolve()
          }
        }
      })
    })

    it('should do nothing if there is no ids nor index and collection', () => {
      kuzzleWrapper.performDeleteDocuments()
    })

    it('should reject a promise', (done) => {
      kuzzleWrapper.performDeleteDocuments('index', 'collection', [42])
        .then(() => {})
        .catch(e => {
          expect(e.message).to.equals('error')
          done()
        })
    })

    it('should delete a document and refresh the index, then resolve a promise', (done) => {
      triggerError = false
      kuzzleWrapper.performDeleteDocuments('index', 'collection', [42])
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
    let off = sandbox.stub()
    let on = sandbox.stub()
    let setTokenValid = sandbox.stub()

    it('should call off and on with right params', () => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          host: 'toto',
          port: 8888,
          state: 'connecting',
          addListener (event, cb) {
            cb({message: null})
          },
          off,
          on
        }
      })

      let store = {state: {kuzzle: {}}, commit: sandbox.stub()}
      kuzzleWrapper.initStoreWithKuzzle(store)

      expect(off.calledWith('tokenExpired'))
      expect(off.calledWith('queryError'))
      expect(off.calledWith('networkError'))
      expect(off.calledWith('connected'))
      expect(off.calledWith('reconnected'))
      expect(off.calledWith('discarded'))
      expect(setTokenValid.calledWithMatch(store, false))
    })
  })

  describe('performSearchUsers', () => {
    let kuzzleWrapper
    const userExample = {
      content: {
        aField: 'aValue'
      },
      id: 'toto',
      meta: {}
    }
    const credentialExample = {
      credential: 'something',
      otherCredential: 'item'
    }
    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          security: {
            searchUsersPromise: () => {
              return Promise.resolve({
                users: [userExample],
                total: 1
              })
            },
            getCredentialsPromise: () => {
              return Promise.resolve(credentialExample)
            }
          },
          queryPromise: () => {
            return Promise.resolve({
              result: ['strategy-1']
            })
          }
        }
      })
    })

    it('should return a well-formed result', () => {
      return kuzzleWrapper
        .performSearchUsers('collection', 'index', {}, {})
        .then(res => {
          expect(res).to.have.property('documents')
          expect(res).to.have.property('total')
          expect(res.total).to.be.equal(1)
          expect(res.documents).to.be.an('array')
          expect(res.documents.length).to.be.equal(1)
          expect(res.documents[0].id).to.be.equal(userExample.id)
          expect(res.documents[0].meta).to.eql(userExample.meta)
          expect(res.documents[0].content).to.eql(userExample.content)
          expect(res.documents[0].credentials).to.eql({
            'strategy-1': credentialExample
          })
        })
    })

    it('should properly add additionalAttribute when sort is specified as string', () => {
      return kuzzleWrapper
        .performSearchUsers('collection', 'index', {}, {}, ['aField'])
        .then(res => {
          expect(res.documents[0]).to.have.property('additionalAttribute')
          expect(res.documents[0].additionalAttribute).to.have.property('name')
          expect(res.documents[0].additionalAttribute.name).to.be.equal('aField')
        })
    })
  })

  describe('performSearchProfiles', () => {
    let kuzzleWrapper
    const profileExample = {
      content: {
        aField: 'aValue'
      },
      meta: {},
      id: 'toto'
    }
    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          security: {
            searchProfilesPromise: () => {
              return Promise.resolve({
                profiles: [profileExample],
                total: 1
              })
            }
          }
        }
      })
    })
    it('should return a well-formed result', () => {
      return kuzzleWrapper
        .performSearchProfiles()
        .then(res => {
          expect(res).to.have.property('documents')
          expect(res).to.have.property('total')
          expect(res.total).to.be.equal(1)
          expect(res.documents).to.be.an('array')
          expect(res.documents.length).to.be.equal(1)
          expect(res.documents[0].id).to.be.equal(profileExample.id)
          expect(res.documents[0].meta).to.eql(profileExample.meta)
          expect(res.documents[0].content).to.eql(profileExample.content)
        })
    })
  })

  describe('performSearchRoles', () => {
    let kuzzleWrapper
    const roleExample = {
      content: {
        aField: 'aValue'
      },
      meta: {},
      id: 'toto'
    }
    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        './kuzzle': {
          security: {
            searchRolesPromise: () => {
              return Promise.resolve({
                roles: [roleExample],
                total: 1
              })
            }
          }
        }
      })
    })
    it('should return a well-formed result', () => {
      return kuzzleWrapper
        .performSearchRoles()
        .then(res => {
          expect(res).to.have.property('documents')
          expect(res).to.have.property('total')
          expect(res.total).to.be.equal(1)
          expect(res.documents).to.be.an('array')
          expect(res.documents.length).to.be.equal(1)
          expect(res.documents[0].id).to.be.equal(roleExample.id)
          expect(res.documents[0].meta).to.eql(roleExample.meta)
          expect(res.documents[0].content).to.eql(roleExample.content)
        })
    })
  })
})
