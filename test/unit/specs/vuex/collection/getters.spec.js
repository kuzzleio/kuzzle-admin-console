import * as collectionGetters from '../../../../../src/vuex/modules/collection/getters'
import {elements} from '../../../../../src/config/schemaMapping'

describe('Vuex collection getters', () => {
  describe('flattenSchemaWithType', () => {
    it('should return empty object if flattenMapping is empty', () => {
      expect(collectionGetters.flattenSchemaWithType({}, {flattenMapping: {}})).deep.eql({})
    })
    it('should get the schema from flattenSchema', () => {
      let getters = {
        flattenMapping: {
          'name.first': 'text',
          'name.last': 'text'
        },
        flattenSchema: {
          'name.first': elements['input:text'],
          'name.last': elements['input:text']
        }
      }

      expect(collectionGetters.flattenSchemaWithType({}, getters)).deep.eql({
        'name.first': elements['input:text'],
        'name.last': elements['input:text']
      })
    })
    it('should get the schema and merge with mapping', () => {
      let getters = {
        flattenMapping: {
          'name.first': 'text',
          'name.last': 'text'
        },
        flattenSchema: {
          'name.first': elements['input:text']
        }
      }

      expect(collectionGetters.flattenSchemaWithType({}, getters)).deep.eql({
        'name.first': elements['input:text'],
        'name.last': elements['input:text']
      })
    })
  })
})
