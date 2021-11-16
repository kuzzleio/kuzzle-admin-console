import _ from 'lodash'
import { config, elementJson, elements } from '../config/schemaMapping'

const isObject = item => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Do a deep merge
 * @param target
 * @param source
 * @returns {*}
 */

export const mergeSchemaMapping = (target, source, propertiesCounter = 0) => {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (!target[key]) {
        if (source[key].type) {
          target[key] = config[source[key].type]
            ? config[source[key].type].default
            : { ...elements['json'] }
        } else if (source[key].properties) {
          if (propertiesCounter >= 2) {
            target[key] = { ...elements['json'] }
            return
          }
          propertiesCounter += 1

          target[key] = {
            tag: 'fieldset',
            properties: mergeSchemaMapping(
              {},
              source[key].properties,
              propertiesCounter
            )
          }
          propertiesCounter = 0
        }
      }
    })
  }
  return target
}

export const flattenObjectMapping = (mapping, path = '', level = 1) => {
  let flattenObj = {}

  if (path !== '') {
    path += '.'
  }

  Object.keys(mapping).forEach(attribute => {
    if (mapping[attribute].properties) {
      if (level > 1) {
        flattenObj[path + attribute] = 'force-json'
      } else {
        flattenObj = {
          ...flattenObj,
          ...flattenObjectMapping(
            mapping[attribute].properties,
            path + attribute,
            level + 1
          )
        }
      }
    } else {
      flattenObj[path + attribute] = mapping[attribute].type
    }
  })

  return flattenObj
}

/**
 * Returns the schema with only one level: {a: [...], b: {c: [...]}} will returns {'a': [...], 'b.c': [...]}
 * @param schema {Object}
 * @param path {String}
 * @param level {Number}
 * @returns {Object}
 */
export const flattenObjectSchema = (schema, path = '', level = 1) => {
  let flattenObj = {}

  if (path !== '') {
    path += '.'
  }

  Object.keys(schema).forEach(attribute => {
    if (schema[attribute].properties) {
      if (level > 1) {
        flattenObj[path + attribute] = { ...elementJson }
      } else {
        flattenObj = {
          ...flattenObj,
          ...flattenObjectSchema(
            schema[attribute].properties,
            path + attribute,
            level + 1
          )
        }
      }
    } else {
      flattenObj[path + attribute] = schema[attribute]
    }
  })

  return flattenObj
}

export const getSchemaForType = type => {
  if (!config[type] || !config[type].elements) {
    return [{ ...elementJson }]
  }

  return config[type].elements
    .map(element => {
      return { ...element }
    })
    .concat([{ ...elementJson }])
}

export const getDefaultSchemaForType = type => {
  if (!config[type] || !config[type].default) {
    return { ...elementJson }
  }

  return { ...config[type].default }
}

export const getElementDefinition = id => {
  return elements[id]
}

export const castByElementId = (id, value) => {
  let element = elements[id]
  if (!element) {
    return value
  }

  switch (element.cast) {
    case 'integer':
      return parseInt(value) || null
    case 'float':
      return parseFloat(value) || null
    default:
      return value
  }
}

/**
 * Format schema in order to be stored in Kuzzle: add the tag "fieldset" for attribute with sub properties
 * @param schema {Object}
 * @returns {Object} the formatted schema ready to be stored
 */
export const formatSchema = schema => {
  let formattedSchema = {}
  Object.keys(schema).map(attributeName => {
    let fullPath = attributeName

    if (attributeName.indexOf('.') !== -1) {
      let path = attributeName.split('.')
      fullPath = [path[0], 'properties', ...path.slice(1)].join('.')
    }

    _.set(formattedSchema, fullPath, schema[attributeName])
  })

  return formattedSchema
}

/**
 * Returns the merge of mapping, schema and allowForm in order to be stored in Kuzzle
 * @param mapping {Object}
 * @returns {{properties: {}, _meta: {schema: *, allowForm: *}}}
 */
export const mergeMetaAttributes = ({ mapping, schema, dynamic }) => {
  return { properties: { ...mapping }, _meta: { schema }, dynamic }
}

/**
 * Returns a cleaned mapping with only "attribute: attributeType"
 * @param mapping {Object}
 * @returns the cleaned mapping
 */
export const cleanMapping = mapping => {
  let _mapping = {}

  Object.keys(mapping).forEach(attr => {
    if (mapping[attr].properties) {
      _mapping[attr] = cleanMapping(mapping[attr].properties)
    } else {
      _mapping[attr] = mapping[attr].type
    }
  })

  return _mapping
}

/**
 * Returns true if there is no attribute in json that is not present in document
 * @param document {Object}
 * @param schema {Object}
 */
export const hasSameSchema = (document, schema) => {
  return Object.keys(document).every(attribute => {
    return checkPathSchemaRecursive(document, schema, attribute)
  })
}

const checkPathSchemaRecursive = (document, schema, path) => {
  let pathSchema = path.split('.').join('.properties.')
  if (!_.has(schema, pathSchema)) {
    return false
  }

  if (_.get(schema, pathSchema).properties) {
    return Object.keys(_.get(document, path)).every(attribute => {
      return checkPathSchemaRecursive(document, schema, path + '.' + attribute)
    })
  }

  return true
}

export const convertToCSV = (
  items: Array<Object>,
  fields: string[],
  separator = ','
): string => {
  let res = fields.join(separator)
  return items
    .map(i =>
      pickValues(i, fields)
        .map(formatValueForCSV)
        .join(separator)
    )
    .reduce(
      (previous: string, current: string): string => `${previous}\n${current}`,
      res
    )
}
/**
 * An iteration-order-safe version of lodash.values
 *
 * @param object The object containing the values
 * @param fields The field names to pick in the right order
 * @returns The values in the same order as the fields
 * @see https://lodash.com/docs/4.17.15#values
 */
export function pickValues(object: Object, fields: string[]): any[] {
  return fields.map(f => object[f])
}

export function formatValueForCSV(value) {
  if (_.isObject(value)) {
    return '[NOT_SCALAR]'
  }

  return value
}
