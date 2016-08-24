const isObject = item => {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null)
}

/**
 * Do a deep merge
 * @param target
 * @param source
 * @returns {*}
 */
export const mergeDeep = (target, source) => {
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return target
}

/**
 * Restructure object if it is a geo_point so it will be interpreted by jsonform component correctly
 * @param document
 */
export const formatGeoPoint = (document) => {
  Object.keys(document).forEach(o => {
    if (document[o].type === 'geo_point') {
      document[o] = {
        properties: {
          lat: {
            type: 'double'
          },
          lon: {
            type: 'double'
          }
        }
      }
    }
  })
}
