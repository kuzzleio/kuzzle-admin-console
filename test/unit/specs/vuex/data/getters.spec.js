import * as getters from '../../../../../src/vuex/modules/data/getters'

describe('Test data getters', () => {
  describe('indexesAndCollections', () => {
    var state = {
      indexesAndCollections: {
        foo: {
          stored: ['storedCollection'],
          realtime: ['realtimeCollection']
        }
      },
      indexes: ['foo'],
      mapping: {
        myField: {
          properties: {
            type: 'string'
          }
        }
      },
      newDocument: {
        myField: 'foo'
      }
    }

    it('should get indexesAndCollections list', () => {
      console.log(getters)
      expect(getters.indexesAndCollections(state)).to.deep.equal(state.indexesAndCollections)
    })

    it('should get indexes list', () => {
      expect(getters.indexes(state)).to.deep.equal(state.indexes)
    })

    it('should get mapping', () => {
      expect(getters.mapping(state)).to.deep.equal(state.mapping)
    })

    it('should get newDocument', () => {
      expect(getters.newDocument(state)).to.deep.equal(state.newDocument)
    })
  })
})
