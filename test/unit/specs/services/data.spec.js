import {
  dedupeRealtimeCollections,
  getCollectionsFromTree,
  getCollectionCount
} from '../../../../src/services/data'

let tree = {
  'name': 'kuzzle-bo-testindex',
  'collections': {
    'stored': [
      'emptiable-collection',
      'kuzzle-bo-test',
      'readonly-collection',
      'private-collection',
      'editable-collection',
      'not-editable-collection'
    ],
    'realtime': [
      'realtime-collection',
      'rairia-collection',
      'tatatat-collection'
    ]
  }
}
let foo = {
  name: 'foo',
  collections: {
    stored: ['foo-stored'],
    realtime: ['foo-realtime']
  }
}

describe('Data services', () => {
  describe('dedupeRealtimeCollections', () => {
    it('should correctly dedupe realtime collections that are also persisted', () => {
      let collectionsToDedupe = {
        realtime: ['foo', 'bar'],
        stored: ['foo']
      }
      expect(dedupeRealtimeCollections(collectionsToDedupe)).to.deep.equals({
        realtime: ['bar'],
        stored: ['foo']
      })
    })
    it('should do nothing if no realtime collections are present', () => {
      let nothingToDedupe = {
        stored: ['foo']
      }
      expect(dedupeRealtimeCollections(nothingToDedupe)).to.deep.equals(nothingToDedupe)
    })
  })

  describe('getCollectionCount', () => {
    it('should return correct amount of collections', () => {
      expect(getCollectionCount(tree.collections)).to.equal(9)
      tree.collections.stored.push('toto')
      expect(getCollectionCount(tree.collections)).to.equal(10)
      expect(getCollectionCount({name: 'empty-index', collections: {}})).to.equal(0)
    })
  })

  describe('getCollectionsFromTree', () => {
    it('should return correct collection list', () => {
      expect(getCollectionsFromTree([
        tree,
        foo
      ], 'foo')).to.deep.equals(foo.collections)
      expect(getCollectionsFromTree([
        tree,
        foo
      ], 'YOLO')).to.deep.equals([])
    })
  })
})
