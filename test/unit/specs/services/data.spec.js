import {
  dedupeRealtimeCollections
} from '../../../../src/services/data'

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
})
