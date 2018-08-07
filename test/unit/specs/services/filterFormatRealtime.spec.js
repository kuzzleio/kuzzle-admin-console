import { formatFromBasicSearch } from '../../../../src/services/filterManagerRealtime'

describe('filterFormatRealtime tests', () => {
  describe('formatFromBasicSearch tests', () => {
    it('should return empty object if group is empty', () => {
      expect(formatFromBasicSearch([])).to.deep.equals({})
    })

    it('should return standard object if attribute is null', () => {
      expect(formatFromBasicSearch([[{ attribute: null }]])).to.deep.equals({
        or: [
          {
            and: []
          }
        ]
      })
    })

    it('should return object with match operator', () => {
      expect(
        formatFromBasicSearch([
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
        formatFromBasicSearch([
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
        formatFromBasicSearch([
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
        formatFromBasicSearch([
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
        formatFromBasicSearch([
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
})
