const kuzzleWrapperInjector = require('inject-loader!../../../../src/services/kuzzleWrapper')

let sandbox = sinon.sandbox.create()

describe('Kuzzle wrapper service', () => {
  describe('performSearch tests', () => {
    let triggerError = true
    const fakeResponse = {
      total: 42,
      hits: [
        {
          _source: {
            name: {
              first: 'toto'
            }
          },
          _id: 'id',
          _meta: {
            createdAt: 10101101
          }
        }
      ]
    }
    const fakeFormattedResponse = {
      total: 42,
      documents: [
        {
          content: {
            name: {
              first: 'toto'
            }
          },
          id: 'id',
          meta: {
            createdAt: 10101101
          }
        }
      ]
    }
    const formattedResponseWithAdditionalAttr = {
      documents: [
        {
          content: { name: { first: 'toto' } },
          id: 'id',
          additionalAttribute: { name: 'name.first', value: 'toto' },
          meta: {
            createdAt: 10101101
          }
        }
      ],
      total: 42
    }
    let kuzzleWrapper

    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              document: {
                search() {
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
        }
      })
    })

    it('should reject a promise as there is no collection nor index', done => {
      kuzzleWrapper
        .performSearchDocuments()
        .then(() => {})
        .catch(err => {
          expect(err.message).to.equals('Missing collection or index')
          done()
        })
    })

    it('should reject a promise', done => {
      kuzzleWrapper
        .performSearchDocuments('collection', 'index')
        .then(() => {})
        .catch(e => {
          expect(e.message).to.equals('error')
          done()
        })
    })

    it('should receive documents', done => {
      triggerError = false
      kuzzleWrapper
        .performSearchDocuments('collection', 'index')
        .then(res => {
          expect(res).to.deep.equals(fakeFormattedResponse)
          done()
        })
        .catch(e => done(e))
    })

    it('should receive sorted documents with additional attributes for the sort array', done => {
      triggerError = false
      kuzzleWrapper
        .performSearchDocuments('collection', 'index', {}, {}, [
          { 'name.first': 'asc' }
        ])
        .then(res => {
          expect(res).to.deep.equals(formattedResponseWithAdditionalAttr)
          done()
        })
        .catch(() => {})
    })

    it('should treat a String sort argument as the field to sort by', done => {
      triggerError = false
      kuzzleWrapper
        .performSearchDocuments('collection', 'index', {}, {}, ['name.first'])
        .then(res => {
          expect(res).to.deep.equals(formattedResponseWithAdditionalAttr)
          done()
        })
        .catch(err => {
          console.error(err)
        })
    })
  })

  describe('connectToEnvironment', () => {
    let kuzzleWrapper
    let disconnectMock = sandbox.mock()
    let connectMock = sandbox.mock()

    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              protocol: {
                state: 'connected'
              },
              disconnect: disconnectMock,
              connect: connectMock
            }
          }
        }
      })
    })

    it('should disconnect and reconnect kuzzle after setting the environment params', () => {
      kuzzleWrapper.connectToEnvironment({ host: 'toto.toto', port: 7512 })

      expect(disconnectMock.called).to.equals(true)
      expect(connectMock.called).to.equals(true)
    })
  })

  describe('deleteDocuments tests', () => {
    let triggerError = true
    let kuzzleWrapper

    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              document: {
                mDelete() {
                  if (triggerError) {
                    return Promise.reject(new Error('error'))
                  } else {
                    return Promise.resolve()
                  }
                }
              }
            }
          }
        }
      })
    })

    it('should reject a promise if no ids are given', done => {
      kuzzleWrapper.performDeleteDocuments()
        .catch(() => {
          done()
        })
    })

    it('should reject a promise', done => {
      kuzzleWrapper
        .performDeleteDocuments('index', 'collection', [42])
        .then(() => {})
        .catch(e => {
          expect(e.message).to.equals('error')
          done()
        })
    })

    it('should delete a document and refresh the index, then resolve a promise', done => {
      triggerError = false
      kuzzleWrapper
        .performDeleteDocuments('index', 'collection', [42])
        .then(() => {
          done()
        })
        .catch(error => done(error))
    })
  })

  describe('waitForConnected', () => {
    let kuzzleWrapper
    let removeListener = sandbox.stub()

    it('should resolve if kuzzle is connected', done => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              protocol: {
                state: 'connected'
              }
            }
          }
        }
      })

      kuzzleWrapper
        .waitForConnected()
        .then(() => done())
        .catch(e => done(e))
    })

    it('should resolve if kuzzle trigger event connected', done => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              protocol: {
                state: 'connectiong'
              },
              addListener(event, cb) {
                cb()
              },
              removeListener
            }
          }
        }
      })

      kuzzleWrapper
        .waitForConnected()
        .then(() => {
          expect(removeListener.called).to.be.equal(true)
          done()
        })
        .catch(e => done(e))
    })

    it('should reject if kuzzle never trigger event connected', done => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              protocol: {
                state: 'connectiong'
              },
              addListener: sandbox.stub(),
              removeListener
            }
          }
        }
      })

      kuzzleWrapper
        .waitForConnected(10)
        .then(() => {
          done(new Error('Promise was resolved'))
        })
        .catch(() => done())
    })
  })

  describe('performSearchUsers', () => {
    let kuzzleWrapper
    const userExample = {
      content: {
        aField: 'aValue'
      },
      _id: 'toto',
      meta: {}
    }
    const credentialExample = {
      credential: 'something',
      otherCredential: 'item'
    }
    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              auth: {
                getStrategies: () => {
                  return Promise.resolve(['strategy-1'])
                }
              },
              security: {
                searchUsers: () => {
                  return Promise.resolve({
                    hits: [userExample],
                    total: 1
                  })
                },
                getCredentials: () => {
                  return Promise.resolve(credentialExample)
                }
              }
            }
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
          expect(res.documents[0].id).to.be.equal(userExample._id)
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
          expect(res.documents[0].additionalAttribute.name).to.be.equal(
            'aField'
          )
        })
    })
  })

  describe('performSearchProfiles', () => {
    let kuzzleWrapper
    const profileExample = {
      policies: {
        aField: 'aValue'
      },
      meta: {},
      _id: 'toto'
    }
    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              security: {
                searchProfiles: () => {
                  return Promise.resolve({
                    hits: [profileExample],
                    total: 1
                  })
                }
              }
            }
          }
        }
      })
    })
    it('should return a well-formed result', () => {
      return kuzzleWrapper.performSearchProfiles().then(res => {
        expect(res).to.have.property('documents')
        expect(res).to.have.property('total')
        expect(res.total).to.be.equal(1)
        expect(res.documents).to.be.an('array')
        expect(res.documents.length).to.be.equal(1)
        expect(res.documents[0].id).to.be.equal(profileExample._id)
        expect(res.documents[0].meta).to.eql(profileExample.meta)
        expect(res.documents[0].content.policies).to.eql(profileExample.policies)
      })
    })
  })

  describe('performSearchRoles', () => {
    let kuzzleWrapper
    const roleExample = {
      controllers: {
        aField: 'aValue'
      },
      meta: {},
      _id: 'toto'
    }
    beforeEach(() => {
      kuzzleWrapper = kuzzleWrapperInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              security: {
                searchRoles: () => {
                  return Promise.resolve({
                    hits: [roleExample],
                    total: 1
                  })
                }
              }
            }
          }
        }
      })
    })
    it('should return a well-formed result', () => {
      return kuzzleWrapper.performSearchRoles().then(res => {
        expect(res).to.have.property('documents')
        expect(res).to.have.property('total')
        expect(res.total).to.be.equal(1)
        expect(res.documents).to.be.an('array')
        expect(res.documents.length).to.be.equal(1)
        expect(res.documents[0].id).to.be.equal(roleExample._id)
        expect(res.documents[0].meta).to.eql(roleExample.meta)
        expect(res.documents[0].content.controllers).to.eql(roleExample.controllers)
      })
    })
  })

  describe('performDeleteUsers', () => {
    const queryStub = sinon.stub().returns(Promise.resolve())
    let kuzzleWrapper = kuzzleWrapperInjector({
      'vue': {
        prototype: {
          $kuzzle: {
            security: {
              mDeleteUsers: queryStub
            }
          }
        }
      }
    })

    beforeEach(() => {
      queryStub.resetHistory()
    })

    it('should reject if no ids are provided', () => {
      return kuzzleWrapper.performDeleteUsers().catch(e => {
        expect(e).to.be.an('error')
      })
    })
    it('should not reject if ids are provided', () => {
      return kuzzleWrapper
        .performDeleteUsers('myIndex', 'myCollection', [2])
        .then(() => {
          expect(queryStub.callCount).to.be.equal(1)
        })
    })
  })

  describe('performDeleteProfiles', () => {
    const queryStub = sinon.stub().returns(Promise.resolve())
    let kuzzleWrapper = kuzzleWrapperInjector({
      'vue': {
        prototype: {
          $kuzzle: {
            security: {
              mDeleteProfiles: queryStub
            }
          }
        }
      }
    })

    beforeEach(() => {
      queryStub.resetHistory()
    })

    it('should reject if no ids are provided', () => {
      return kuzzleWrapper.performDeleteProfiles().catch(e => {
        expect(e).to.be.an('error')
      })
    })
    it('should not reject if ids are provided', () => {
      return kuzzleWrapper
        .performDeleteProfiles('myIndex', 'myCollection', [2])
        .then(() => {
          expect(queryStub.callCount).to.be.equal(1)
        })
    })
  })

  describe('performDeleteRoles', () => {
    const queryStub = sinon.stub().returns(Promise.resolve())
    let kuzzleWrapper = kuzzleWrapperInjector({
      'vue': {
        prototype: {
          $kuzzle: {
            security: {
              mDeleteRoles: queryStub
            }
          }
        }
      }
    })

    beforeEach(() => {
      queryStub.resetHistory()
    })

    it('should reject if no ids are provided', () => {
      return kuzzleWrapper.performDeleteRoles().catch(e => {
        expect(e).to.be.an('error')
      })
    })
    it('should not reject if ids are provided', () => {
      return kuzzleWrapper.performDeleteRoles([2]).then(() => {
        expect(queryStub.callCount).to.be.equal(1)
      })
    })
  })
})
