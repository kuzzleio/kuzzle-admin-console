import {basicFilter, rawFilter, sorting} from '../../../../../../src/vuex/modules/common/crudlDocument/getters'

describe('List getters tests', () => {
  describe('basicFilter tests', () => {
    it('should return null if basicFilter is not JSON', () => {
      expect(basicFilter({route: {query: {basicFilter: 'not a json'}}})).to.be.null
    })
  })

  describe('rawFilter tests', () => {
    it('should return null if rawFilter is not JSON', () => {
      expect(rawFilter({route: {query: {rawFilter: 'not a json'}}})).to.be.null
    })
  })

  describe('sorting tests', () => {
    it('should return null if sorting is undefined', () => {
      expect(sorting({route: {query: {}}}, {}, {route: {query: {}}})).to.be.null
    })

    it('should return an empty array if sorting is not JSON', () => {
      expect(sorting({route: {query: {sorting: 'not a json'}}}, {}, {route: {query: {sorting: 'fake'}}})).to.deep.equals([])
    })
  })
})
