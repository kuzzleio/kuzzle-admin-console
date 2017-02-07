import {config, elementJson} from '../config/schemaMapping'

const isObject = item => {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null)
}

/**
 * Do a deep merge
 * @param target
 * @param source
 * @returns {*}
 */

export const mergeDeep = (target, source, schem) => {
  if (isObject(target) && isObject(source)) {
    Object.keys(source)
      .forEach(key => {
        if (!target[key]) {
          console.log(schem, source[key].type)
          target[key] = schem[source[key].type].default
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
    return [{
      name: elementJson.name,
      id: elementJson.id
    }]
  }

  return config[type].elements
    .map(element => {
      return {
        name: element.name,
        id: element.id
      }
    })
    .push({
      name: elementJson.name,
      id: elementJson.id
    })
}

export const getDefaultSchemaForType = (type) => {
  if (!config[type] || !config[type].default) {
    return [{
      name: elementJson.name,
      id: elementJson.id
    }]
  }

  return {
    name: config[type].default.name,
    id: config[type].default.id
  }
}
