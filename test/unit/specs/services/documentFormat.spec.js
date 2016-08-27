import documentFormatInjector from 'inject!../../../../src/services/documentFormat'

describe('documentFormat', () => {
  let documentFormat

  describe('addAttributeFromPath', () => {
    let mapping

    beforeEach(() => {
      documentFormat = documentFormatInjector({
        'vue': {
          set: (obj, attr, content) => {
            obj[attr] = content
          }
        }
      })

      mapping = {
        a: {
          properties: {}
        }
      }
    })

    it('should add an attribute if path is root', () => {
      documentFormat.addAttributeFromPath(mapping, '/', 'foo', 'bar')
      expect(mapping.foo).to.equals('bar')
    })

    it('should add nested attribute', () => {
      documentFormat.addAttributeFromPath(mapping, 'a', 'b', 'nested!')
      expect(mapping.a.properties.b).to.equals('nested!')
    })
  })

  describe('getUpdatedSchema', () => {
    let jsonDocument

    beforeEach(() => {
      documentFormat = documentFormatInjector({})

      jsonDocument = {
        foo: 'bar',
        poo: {
          fo: 'poofo'
        },
        oof: {
          bar: {
            baz: 'okay'
          }
        },
        name: {
          surname: 'keke'
        }
      }
    })

    it('should make an object from a json', () => {
      expect(documentFormat.getUpdatedSchema(jsonDocument)).to.deep.equals({
        properties: {
          foo: {type: 'string', val: 'bar'},
          poo: {
            properties: {fo: {type: 'string', val: 'poofo'}},
            type: 'object',
            val: {fo: 'poofo'}
          },
          oof: {
            properties: {
              bar: {
                properties: {baz: {type: 'string', val: 'okay'}},
                type: 'object',
                val: {baz: 'okay'}
              }
            },
            type: 'object',
            val: {bar: {baz: 'okay'}}
          },
          name: {
            properties: {surname: {type: 'string', val: 'keke'}},
            type: 'object',
            val: {surname: 'keke'}
          }
        },
        type: 'object'
      })
    })
  })
})
