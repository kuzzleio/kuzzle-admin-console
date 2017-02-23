import documentFormatInjector from 'inject-loader!../../../../src/services/documentFormat'

describe('documentFormat', () => {
  let documentFormat = documentFormatInjector({})

  describe('getRefMappingFromPath', () => {
    let mapping

    beforeEach(() => {
      mapping = {
        a: {
          properties: {
            b: {
              properties: {
                c: 'toto'
              }
            }
          }
        }
      }
    })

    it('should find path to root', () => {
      let ref = documentFormat.getRefMappingFromPath(mapping, '')
      expect(ref).to.equals(mapping)
    })

    it('should find correct path in object', () => {
      let ref = documentFormat.getRefMappingFromPath(mapping, 'a.b')
      expect(ref).to.equals(mapping.a.properties.b.properties)
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
