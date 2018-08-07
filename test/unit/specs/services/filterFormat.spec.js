import {
  formatFromQuickSearch,
  formatFromBasicSearch,
  formatPagination,
  formatSort
} from '../../../../src/services/filterManager'

describe('filterFormat tests', () => {
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
