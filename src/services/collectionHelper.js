import _ from 'lodash'
import {config, elementJson, elements} from '../config/schemaMapping'

const isObject = item => {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null)
}

/**
 * Do a deep merge
 * @param target
 * @param source
 * @returns {*}
 */

export const mergeDeep = (target, source, propertiesCounter = 0) => {
  if (isObject(target) && isObject(source)) {
    Object.keys(source)
      .forEach(key => {
        if (!target[key]) {
          if (config[source[key].type]) {
            target[key] = config[source[key].type].default
          } else if (source[key].properties) {
            if (propertiesCounter >= 2) {
              target[key] = {
                tag: 'json'
              }
              return
            }
            propertiesCounter += 1

            target[key] = {
              tag: 'fieldset',
              elements: mergeDeep({}, source[key].properties, propertiesCounter)
            }
            propertiesCounter = 0
          }
        }
      })
  }
  return target
}

/**
 * Restructure object according to it's type
 * @param document
 */
export const formatType = (document, collection) => {
  if (collection === 'users' && document.profileIds !== undefined) {
    document.profileIds.type = 'profileIds'
  }
}

export const flattenMapping = (mapping, path = '', level = 1) => {
  let flattenObj = {}

  if (path !== '') {
    path += '.'
  }

  Object.keys(mapping)
    .forEach(attribute => {
      if (mapping[attribute].properties) {
        if (level > 1) {
          flattenObj[path + attribute] = 'force-json'
        } else {
          flattenObj = {...flattenObj, ...flattenMapping(mapping[attribute].properties, path + attribute, level + 1)}
        }
      } else {
        flattenObj[path + attribute] = mapping[attribute].type
      }
    })

  return flattenObj
}

export const getSchemaForType = (type) => {
  if (!config[type] || !config[type].elements) {
    return [{...elementJson}]
  }

  return config[type].elements
    .map(element => {
      return {...element}
    })
    .concat([{...elementJson}])
}

export const getDefaultSchemaForType = (type) => {
  if (!config[type] || !config[type].default) {
    return [{...elementJson}]
  }

  return {...config[type].default}
}

export const getElementDefinition = (id) => {
  return elements[id]
}

export const castByElementId = (id, value) => {
  let element = elements[id]
  if (!element) {
    return value
  }

  switch (element.type) {
    case 'integer':
      return parseInt(value) || null
    case 'float':
      return parseFloat(value) || null
    default:
      return value
  }
}

export const mergeMappingAndSchema = (mapping, schema) => {
  let _meta = {}
  Object.keys(schema).map(attributeName => {
    let fullPath = attributeName

    if (attributeName.indexOf('.') !== -1) {
      let path = attributeName.split('.')
      _.set(_meta, path[0], {tag: 'fieldset', properties: {}})
      fullPath = [path[0], 'properties', ...path.slice(1)].join('.')
    }

    _.set(_meta, fullPath, schema[attributeName])
  })

  return {properties: {...mapping}, _meta}
}
