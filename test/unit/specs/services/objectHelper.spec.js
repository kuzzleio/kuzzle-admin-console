import {mergeSchemaMapping, countAttributes} from '../../../../src/services/collectionHelper'

describe('objectHelper', () => {
  describe('mergeSchemaMapping', () => {
    let source
    let target

    beforeEach(() => {
      source = {
        foo: {
          bar: {
            one: 'one'
          }
        },
        baz: {
          zab: 'kk'
        }
      }
      target = {
        foo: {
          bar: {
            two: 'two'
          }
        }
      }
    })

    it('should return attribute because it is not an object', () => {
      expect(mergeSchemaMapping('test', 'notObject')).to.equals('test')
    })

    it('should deeply merge two object', () => {
      expect(mergeSchemaMapping(target, source)).to.deep.equals({
        foo: {
          bar: {
            one: 'one',
            two: 'two'
          }
        },
        baz: {
          zab: 'kk'
        }
      })
    })
  })

  describe('countAttributes', () => {
    let object = {
      foo: {
        properties: {
          bar: {
            properties: {
              baz: {
                properties: {
                  value: 'hello'
                }
              }
            }
          }
        }
      },
      rab: {
        properties: {
          oof: {
            properties: {
              eulav: 'world'
            }
          }
        }
      }
    }

    it('should return the number of attribute of an object', () => {
      expect(countAttributes(object)).to.equals(7)
    })
  })
})
