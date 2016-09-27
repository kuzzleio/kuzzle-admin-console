import {
  dedupeRealtimeCollections,
  generateHash
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

    describe('generateHash', () => {
      it('should generate an empty hash for an empty string', () => {
        expect(generateHash('')).to.equals(0)
        expect(generateHash(null)).to.equals(0)
        expect(generateHash(undefined)).to.equals(0)
      })

      it('should generate a valid hash for a valid string', () => {
        expect(generateHash('a valid string')).to.not.equals(0)
      })
    })
  })
})
