import * as collectionHelper from '../../../../src/services/collectionHelper'
import { config, elements } from '../../../../src/config/schemaMapping'
import { expect } from 'chai'

describe('CollectionHelper', () => {
  describe('mergeSchemaMapping', () => {
    it('should return target if target is not an object', () => {
      expect(
        collectionHelper.mergeSchemaMapping('toto', { toto: 'tata' })
      ).be.eql('toto')
    })

    it('should return target if source is not an object', () => {
      expect(
        collectionHelper.mergeSchemaMapping({ toto: 'tata' }, 'tata')
      ).deep.eq({ toto: 'tata' })
    })

    it('should add the default schema from mapping', () => {
      let target = {}
      let source = {
        toto: { type: 'text' }
      }

      expect(collectionHelper.mergeSchemaMapping(target, source)).deep.eq({
        toto: config['text'].default
      })
    })

    it('should set the tag json if there is no element for the type', () => {
      let target = {}
      let source = {
        toto: { type: 'toto' }
      }

      expect(collectionHelper.mergeSchemaMapping(target, source)).deep.eq({
        toto: elements['json']
      })
    })

    it('should do nothing when the schema is already configured', () => {
      let target = {
        toto: elements['textarea']
      }
      let source = {
        toto: { type: 'text' }
      }

      expect(collectionHelper.mergeSchemaMapping(target, source)).deep.eq({
        toto: elements['textarea']
      })
    })

    it('should loop on properties', () => {
      let target = {}
      let source = {
        name: {
          properties: {
            first: { type: 'text' },
            last: { type: 'text' }
          }
        }
      }

      expect(collectionHelper.mergeSchemaMapping(target, source)).deep.eq({
        name: {
          tag: 'fieldset',
          properties: {
            first: config['text'].default,
            last: config['text'].default
          }
        }
      })
    })

    it('should set json when the depth exceed 2', () => {
      let target = {}
      let source = {
        person: {
          tag: 'fieldset',
          properties: {
            identity: {
              tag: 'fieldset',
              properties: {
                name: {
                  properties: {
                    name: { type: 'text' }
                  }
                }
              }
            }
          }
        }
      }

      expect(collectionHelper.mergeSchemaMapping(target, source)).deep.eq({
        person: {
          tag: 'fieldset',
          properties: {
            identity: {
              tag: 'fieldset',
              properties: {
                name: elements['json']
              }
            }
          }
        }
      })
    })
  })

  describe('flattenObjectMapping', () => {
    it('should return empty object if mapping is empty', () => {
      expect(collectionHelper.flattenObjectMapping({})).deep.eq({})
    })

    it('should return attribute with type if there is no depth', () => {
      expect(
        collectionHelper.flattenObjectMapping({ toto: { type: 'text' } })
      ).deep.eq({ toto: 'text' })
    })

    it('should loop in properties', () => {
      let mapping = {
        name: {
          properties: {
            first: { type: 'text' },
            last: { type: 'text' }
          }
        }
      }

      expect(collectionHelper.flattenObjectMapping(mapping)).deep.eq({
        'name.first': 'text',
        'name.last': 'text'
      })
    })

    it('should loop in properties with max depth 2', () => {
      let mapping = {
        person: {
          properties: {
            identity: {
              properties: {
                name: {
                  properties: {
                    first: { type: 'text' },
                    last: { type: 'text' }
                  }
                }
              }
            }
          }
        }
      }

      expect(collectionHelper.flattenObjectMapping(mapping)).deep.eq({
        'person.identity': 'force-json'
      })
    })
  })

  describe('flattenObjectSchema', () => {
    it('should return empty object if schema is empty', () => {
      expect(collectionHelper.flattenObjectSchema({})).deep.eq({})
    })

    it('should return schema if there is no depth', () => {
      expect(
        collectionHelper.flattenObjectSchema({ toto: { tag: 'input' } })
      ).deep.eq({ toto: { tag: 'input' } })
    })

    it('should loop in properties', () => {
      let mapping = {
        name: {
          properties: {
            first: { tag: 'input' },
            last: { tag: 'input' }
          }
        }
      }

      expect(collectionHelper.flattenObjectSchema(mapping)).deep.eq({
        'name.first': { tag: 'input' },
        'name.last': { tag: 'input' }
      })
    })

    it('should loop in properties with max depth 2', () => {
      let mapping = {
        person: {
          properties: {
            identity: {
              properties: {
                name: {
                  properties: {
                    first: { tag: 'input' },
                    last: { tag: 'input' }
                  }
                }
              }
            }
          }
        }
      }

      expect(collectionHelper.flattenObjectSchema(mapping)).deep.eq({
        'person.identity': { ...elements['json'] }
      })
    })
  })

  describe('getSchemaForType', () => {
    it('should return an array with json schema if type does not exist', () => {
      expect(collectionHelper.getSchemaForType('notexist')).deep.eq([
        { ...elements['json'] }
      ])
    })

    it('should return the whole list of available elements plus the json element', () => {
      let expected = [
        elements['input:text'],
        elements['textarea'],
        elements['rich-text'],
        elements['select:text'],
        elements['mselect:text'],
        elements['json']
      ]

      expect(collectionHelper.getSchemaForType('text')).deep.eq(expected)
    })
  })

  describe('getDefaultSchemaForType', () => {
    it('should return element json if type does not exist', () => {
      expect(collectionHelper.getDefaultSchemaForType('notexist')).deep.eq({
        ...elements['json']
      })
    })
    it('should return the default element for the specified type', () => {
      expect(collectionHelper.getDefaultSchemaForType('text')).deep.eq(
        elements['input:text']
      )
    })
  })

  describe('castByElementId', () => {
    it('should return same value if element does not exist', () => {
      expect(collectionHelper.castByElementId('toto', '10')).eql('10')
    })
    it('should return same value if element does not have cast', () => {
      expect(collectionHelper.castByElementId('textarea', '10')).eql('10')
    })
    it('should cast to integer the select:integer element', () => {
      expect(collectionHelper.castByElementId('select:integer', '10')).eql(10)
      expect(collectionHelper.castByElementId('select:integer', '10.5')).eql(10)
    })
    it('should cast to float the select:float element', () => {
      expect(collectionHelper.castByElementId('select:float', '10.5')).eql(10.5)
    })
  })

  describe('formatSchema', () => {
    it('should explode to complex json a flat schema', () => {
      let schema = {
        age: elements['integer'],
        'name.first': elements['input:text'],
        'name.last': elements['input:text']
      }

      expect(collectionHelper.formatSchema(schema)).deep.eq({
        age: elements['integer'],
        name: {
          properties: {
            first: elements['input:text'],
            last: elements['input:text']
          }
        }
      })
    })
  })

  describe('mergeMetaAttributes', () => {
    it('should merge meta attributes and mapping', () => {
      let mapping = { mapping: 'mapping' }
      let schema = { schema: 'schema' }
      let allowForm = true

      expect(
        collectionHelper.mergeMetaAttributes({ mapping, schema, allowForm })
      ).deep.eq({
        properties: mapping,
        _meta: {
          schema,
          allowForm
        }
      })
    })
  })

  describe('cleanMapping', () => {
    it('should return a clean mapping with only type', () => {
      let mapping = {
        name: {
          properties: {
            first: { type: 'text' },
            last: { type: 'text' }
          }
        }
      }

      expect(collectionHelper.cleanMapping(mapping)).deep.eq({
        name: {
          first: 'text',
          last: 'text'
        }
      })
    })
  })

  describe('hasSameSchema', () => {
    it('should return true if schema and document have same properties', () => {
      let schema = {
        name: {
          properties: {
            first: { type: 'text' },
            last: { type: 'text' }
          }
        }
      }
      let document = {
        name: {
          first: 'toto',
          last: 'tutu'
        }
      }

      expect(collectionHelper.hasSameSchema(document, schema)).be.eql(true)
    })

    it('should return false if schema and document have not same properties', () => {
      let schema = {
        name: {
          properties: {
            first: { type: 'text' },
            last: { type: 'text' }
          }
        }
      }
      let document = {
        name: {
          first: 'toto',
          last: 'tutu',
          other: 'other'
        }
      }

      expect(collectionHelper.hasSameSchema(document, schema)).be.eql(false)
    })
  })
})
