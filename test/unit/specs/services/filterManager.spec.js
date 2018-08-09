import {
  formatFromQuickSearch,
  formatFromBasicSearch,
  formatPagination,
  formatSort,
  basicFilterToRealtimeQuery,
  filterManager,
  ACTIVE_BASIC,
  ACTIVE_QUICK,
  ACTIVE_RAW
} from '../../../../src/services/filterManager'

describe('filterManager tests', () => {
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
          active: ACTIVE_BASIC
        })
      ).to.eql({})
      expect(
        filterManager.toSearchQuery({
          active: ACTIVE_QUICK
        })
      ).to.eql({})
      expect(
        filterManager.toSearchQuery({
          active: ACTIVE_RAW
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
          active: ACTIVE_BASIC
        })
      ).to.eql({})
      expect(
        filterManager.toRealtimeQuery({
          active: ACTIVE_QUICK
        })
      ).to.eql({})
      expect(
        filterManager.toRealtimeQuery({
          active: ACTIVE_RAW
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
          'Cannot load filters from localstorage if no index or collection are specfied'
        )
      }
      try {
        filterManager.loadFromLocalStorage('toto')
      } catch (error) {
        expect(error.message).to.equals(
          'Cannot load filters from localstorage if no index or collection are specfied'
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
          state: {
            route: {
              query: {
                raw: '{}',
                basic: '{}',
                sorting: '{}'
              }
            }
          }
        })
      ).to.be.eql({ raw: {}, basic: {}, sorting: {} })
    })
  })

  describe('basicFilterToRealtimeQuery tests', () => {
    it('should return empty object if group is empty', () => {
      expect(basicFilterToRealtimeQuery([])).to.deep.equals({})
    })

    it('should return standard object if attribute is null', () => {
      expect(
        basicFilterToRealtimeQuery([[{ attribute: null }]])
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
        basicFilterToRealtimeQuery([
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
        basicFilterToRealtimeQuery([
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
        basicFilterToRealtimeQuery([
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
        basicFilterToRealtimeQuery([
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
        basicFilterToRealtimeQuery([
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
      expect(formatFromQuickSearch()).to.deep.equals({})
      expect(formatFromQuickSearch('')).to.deep.equals({})
      expect(
        formatFromBasicSearch([
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
      expect(formatFromQuickSearch({ fake: 'fake' })).to.deep.equals(
        formatFromQuickSearch({ fake: 'fake' })
      )
    })
  })

  describe('formatFromBasicSearch tests', () => {
    it('should return empty object if group is empty', () => {
      expect(formatFromBasicSearch([])).to.deep.equals({})
    })

    it('should return standard object if attribute is null', () => {
      expect(formatFromBasicSearch([[{ attribute: null }]])).to.deep.equals({
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
      expect(formatFromBasicSearch()).to.deep.equals({
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
        formatFromBasicSearch([
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
        formatFromBasicSearch([
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
        formatFromBasicSearch([
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
        formatFromBasicSearch([
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
      expect(formatPagination()).to.deep.equals({})
      expect(formatPagination(1)).to.deep.equals({})
    })

    it('should return an object with a from and a size', () => {
      expect(formatPagination(2, 42)).to.deep.equals({ from: 42, size: 42 })
    })
  })

  describe('formatSort tests', () => {
    it('should return an empty array if no attribute is in sorting', () => {
      expect(formatSort({})).to.deep.equals([])
    })

    it('should return a formated object', () => {
      expect(formatSort({ attribute: 'foo', order: 'bar' })).to.deep.equals([
        { foo: { order: 'bar' } }
      ])
    })
  })
})
