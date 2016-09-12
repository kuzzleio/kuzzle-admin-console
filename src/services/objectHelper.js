import Vue from 'vue'

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
        if (!target[key]) {
          Vue.set(target, key, {})
        }
        mergeDeep(target[key], source[key])
      } else {
        Vue.set(target, key, source[key])
      }
    }
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
