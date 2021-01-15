import {
  dedupeRealtimeCollections,
  splitRealtimeStoredCollections,
  generateHash,
  filterIndexesByKeyword
} from '../../../../src/services/data'
import { expect } from 'chai'

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
      expect(dedupeRealtimeCollections(nothingToDedupe)).to.deep.equals(
        nothingToDedupe
      )
    })
  })

  describe('splitRealtimeStoredCollections', () => {
    it('should correctly split realtime and stored collections', () => {
      let collectionsToSplit = [
        { name: 'bar', type: 'realtime' },
        { name: 'foo', type: 'realtime' },
        { name: 'foobar', type: 'stored' }
      ]
      expect(splitRealtimeStoredCollections(collectionsToSplit)).to.deep.equals(
        {
          realtime: ['bar', 'foo'],
          stored: ['foobar']
        }
      )
    })

    it('should correctly split an empty collections result', () => {
      let collectionsToSplit = []

      expect(splitRealtimeStoredCollections(collectionsToSplit)).to.deep.equals(
        {
          realtime: [],
          stored: []
        }
      )
    })

    it('should correctly split an empty stored collections result', () => {
      let collectionsToSplit = [{ name: 'bar', type: 'realtime' }]

      expect(splitRealtimeStoredCollections(collectionsToSplit)).to.deep.equals(
        {
          realtime: ['bar'],
          stored: []
        }
      )
    })

    it('should correctly split an empty realtime collections result', () => {
      let collectionsToSplit = [{ name: 'foobar', type: 'stored' }]

      expect(splitRealtimeStoredCollections(collectionsToSplit)).to.deep.equals(
        {
          realtime: [],
          stored: ['foobar']
        }
      )
    })
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

  describe('filterIndexesByKeyword', () => {
    let indexesAndCollections = {
      toto: {
        stored: ['caca', 'cucu'],
        realtime: ['pepe', 'papa']
      },
      titi: {},
      tata: {}
    }
    let indexes = Object.keys(indexesAndCollections)

    it('should not hide content if filter is empty', () => {
      let filtered = filterIndexesByKeyword(
        indexes,
        indexesAndCollections,
        null
      )
      expect(filtered).to.equals(indexes)
      filtered = filterIndexesByKeyword(indexes, indexesAndCollections, '')
      expect(filtered).to.equals(indexes)
    })

    it('should not hide content if filter is contained in the name of index tree', () => {
      let filtered = filterIndexesByKeyword(
        indexes,
        indexesAndCollections,
        'to'
      )
      expect(filtered).to.deep.equals([indexes[0]])
    })

    it('should not hide content if filter is contained in the stored collections of index tree', () => {
      let filtered = filterIndexesByKeyword(
        indexes,
        indexesAndCollections,
        'ca'
      )
      expect(filtered).to.deep.equals([indexes[0]])
    })

    it('should not hide content if filter is contained in the realtime collections of index tree', () => {
      let filtered = filterIndexesByKeyword(
        indexes,
        indexesAndCollections,
        'pa'
      )
      expect(filtered).to.deep.equals([indexes[0]])
    })

    it('should hide content if filter is not found', () => {
      let filtered = filterIndexesByKeyword(
        indexes,
        indexesAndCollections,
        'tu'
      )
      expect(filtered).to.deep.equals([])
    })
  })
})
