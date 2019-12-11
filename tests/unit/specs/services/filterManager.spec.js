import * as filterManager from '../../../../src/services/filterManager'

import { expect } from 'chai'

describe('filterManager tests', () => {
  beforeEach(() => {
    global.localStorage = {
      setItem: () => {},
      getItem: () => {},
      clear: () => {}
    }
  })

  describe('toSearchQuery tests', () => {
    it('throws if no filter specified', () => {
      try {
        filterManager.toSearchQuery()
      } catch (error) {
        expect(error.message).to.equals('No filter specified')
      }
    })

    it('returns an object if a filter is passed as param', () => {
      expect(
        filterManager.toSearchQuery({
          active: null
        })
      ).to.eql({})
      expect(
        filterManager.toSearchQuery({
          active: filterManager.ACTIVE_BASIC
        })
      ).to.eql({})
      expect(
        filterManager.toSearchQuery({
          active: filterManager.ACTIVE_QUICK
        })
      ).to.eql({})
      expect(
        filterManager.toSearchQuery({
          active: filterManager.ACTIVE_RAW
        })
      ).to.eql({})
    })
  })

  describe('toRealtimeQuery', () => {
    it('throws if no filter specified', () => {
      try {
        filterManager.toRealtimeQuery()
      } catch (error) {
        expect(error.message).to.equals('No filter specified')
      }
    })
    it('returns an object if a filter is passed as param', () => {
      expect(
        filterManager.toRealtimeQuery({
          active: null
        })
      ).to.eql({})
      expect(
        filterManager.toRealtimeQuery({
          active: filterManager.ACTIVE_BASIC
        })
      ).to.eql({})
      expect(
        filterManager.toRealtimeQuery({
          active: filterManager.ACTIVE_QUICK
        })
      ).to.eql({})
      expect(
        filterManager.toRealtimeQuery({
          active: filterManager.ACTIVE_RAW
        })
      ).to.eql({})
    })
  })

  describe('loadFromLocalStorage', () => {
    it('throws if no index or collection specified', () => {
      try {
        filterManager.loadFromLocalStorage()
      } catch (error) {
        expect(error.message).to.equals(
          'Cannot load filters from localstorage if no index or collection are specified'
        )
      }
      try {
        filterManager.loadFromLocalStorage('toto')
      } catch (error) {
        expect(error.message).to.equals(
          'Cannot load filters from localstorage if no index or collection are specified'
        )
      }
    })
    it('returns an object if called with index and collection ', () => {
      expect(filterManager.loadFromLocalStorage('titi', 'toto')).to.be.eql({})
    })
  })

  describe('loadFromRoute', () => {
    it('throws if no store specified', () => {
      try {
        filterManager.loadFromRoute()
      } catch (error) {
        expect(error.message).to.equals('No store specified')
      }
    })

    it('returns an object if called with store', () => {
      expect(
        filterManager.loadFromRoute({
          query: {
            raw: '{}',
            basic: '{}',
            sorting: '{}'
          }
        })
      ).to.be.eql({ raw: {}, basic: {}, sorting: {} })
    })
  })

  describe('basicFilterToRealtimeQuery tests', () => {
    it('should return empty object if group is empty', () => {
      expect(filterManager.basicFilterToRealtimeQuery([])).to.deep.equals({})
    })

    it('should return standard object if attribute is null', () => {
      expect(
        filterManager.basicFilterToRealtimeQuery([[{ attribute: null }]])
      ).to.deep.equals({
        or: [
          {
            and: []
          }
        ]
      })
    })

    it('should return object with match operator', () => {
      expect(
        filterManager.basicFilterToRealtimeQuery([
          [{ operator: 'match', attribute: 'foo', value: 'bar' }]
        ])
      ).to.deep.equals({
        or: [
          {
            and: [
              {
                equals: { foo: 'bar' }
              }
            ]
          }
        ]
      })
    })

    it('should return object with not_match operator', () => {
      expect(
        filterManager.basicFilterToRealtimeQuery([
          [{ operator: 'not_match', attribute: 'foo', value: 'bar' }]
        ])
      ).to.deep.equals({
        or: [
          {
            and: [
              {
                not: { equals: { foo: 'bar' } }
              }
            ]
          }
        ]
      })
    })

    it('should return object with regexp operator', () => {
      expect(
        filterManager.basicFilterToRealtimeQuery([
          [{ operator: 'regexp', attribute: 'foo', value: 'bar' }]
        ])
      ).to.deep.equals({
        or: [
          {
            and: [
              {
                regexp: { foo: 'bar' }
              }
            ]
          }
        ]
      })
    })

    it('should return object with exists operator', () => {
      expect(
        filterManager.basicFilterToRealtimeQuery([
          [{ operator: 'exists', attribute: 'foo', value: '' }]
        ])
      ).to.deep.equals({
        or: [
          {
            and: [
              {
                exists: { field: 'foo' }
              }
            ]
          }
        ]
      })
    })

    it('should return object with missing operator', () => {
      expect(
        filterManager.basicFilterToRealtimeQuery([
          [{ operator: 'missing', attribute: 'foo', value: '' }]
        ])
      ).to.deep.equals({
        or: [
          {
            and: [
              {
                missing: { field: 'foo' }
              }
            ]
          }
        ]
      })
    })
  })

  describe('formatFromQuickSearch tests', () => {
    it('should return an empty object if there is no searchTerm or wrong operator', () => {
      expect(filterManager.formatFromQuickSearch()).to.deep.equals({})
      expect(filterManager.formatFromQuickSearch('')).to.deep.equals({})
      expect(
        filterManager.formatFromBasicSearch([
          [
            {
              operator: 'wrong',
              attribute: 'foo',
              value: 'bar'
            }
          ]
        ])
      ).to.deep.equals({
        query: { bool: { should: [{ bool: { must: [], must_not: [] } }] } }
      })
    })

    it('should return formatted object', () => {
      expect(
        filterManager.formatFromQuickSearch({ fake: 'fake' })
      ).to.deep.equals(filterManager.formatFromQuickSearch({ fake: 'fake' }))
    })
  })

  describe('filterManager.formatFromBasicSearch tests', () => {
    it('should return empty object if group is empty', () => {
      expect(filterManager.formatFromBasicSearch([])).to.deep.equals({})
    })

    it('should return standard object if attribute is null', () => {
      expect(
        filterManager.formatFromBasicSearch([[{ attribute: null }]])
      ).to.deep.equals({
        query: {
          bool: {
            should: [
              {
                bool: {
                  must: [],
                  must_not: []
                }
              }
            ]
          }
        }
      })
      expect(filterManager.formatFromBasicSearch()).to.deep.equals({
        query: {
          bool: {
            should: [
              {
                bool: {
                  must: [],
                  must_not: []
                }
              }
            ]
          }
        }
      })
    })

    it('should return object with match operator', () => {
      expect(
        filterManager.formatFromBasicSearch([
          [{ operator: 'match', attribute: 'foo', value: 'bar' }]
        ])
      ).to.deep.equals({
        query: {
          bool: {
            should: [
              {
                bool: {
                  must: [{ match_phrase_prefix: { foo: 'bar' } }],
                  must_not: []
                }
              }
            ]
          }
        }
      })
    })

    it('should return object with not_match operator', () => {
      expect(
        filterManager.formatFromBasicSearch([
          [{ operator: 'not_match', attribute: 'foo', value: 'bar' }]
        ])
      ).to.deep.equals({
        query: {
          bool: {
            should: [
              {
                bool: {
                  must: [],
                  must_not: [{ match_phrase_prefix: { foo: 'bar' } }]
                }
              }
            ]
          }
        }
      })
    })

    it('should return object with equal operator', () => {
      expect(
        filterManager.formatFromBasicSearch([
          [{ operator: 'equal', attribute: 'foo', value: 'bar' }]
        ])
      ).to.deep.equals({
        query: {
          bool: {
            should: [
              {
                bool: {
                  must: [{ range: { foo: { gte: 'bar', lte: 'bar' } } }],
                  must_not: []
                }
              }
            ]
          }
        }
      })
    })

    it('should return object with not_equal operator', () => {
      expect(
        filterManager.formatFromBasicSearch([
          [{ operator: 'not_equal', attribute: 'foo', value: 'bar' }]
        ])
      ).to.deep.equals({
        query: {
          bool: {
            should: [
              {
                bool: {
                  must: [],
                  must_not: [{ range: { foo: { gte: 'bar', lte: 'bar' } } }]
                }
              }
            ]
          }
        }
      })
    })
  })

  describe('formatPagination tests', () => {
    it('should return empty object if there is no currentPage or limit', () => {
      expect(filterManager.formatPagination()).to.deep.equals({})
      expect(filterManager.formatPagination(1)).to.deep.equals({})
    })

    it('should return an object with a from and a size', () => {
      expect(filterManager.formatPagination(2, 42)).to.deep.equals({
        from: 42,
        size: 42
      })
    })
  })

  describe('toSort tests', () => {
    it('should sort by `_id` if no attribute is in sorting', () => {
      expect(filterManager.toSort({})).to.deep.equals(['_id'])
    })

    it('should return a formatted object when provided a basic filter', () => {
      expect(
        filterManager.toSort({
          active: 'basic',
          sorting: { attribute: 'foo', order: 'bar' }
        })
      ).to.deep.equals([{ foo: { order: 'bar' } }])
    })

    it('should return a formatted object when provided a raw filter', () => {
      expect(
        filterManager.toSort({
          active: 'raw',
          raw: { query: { bool: {} }, sort: { foo: 'bar' } }
        })
      ).to.deep.equals({ foo: 'bar' })
    })
  })
})
