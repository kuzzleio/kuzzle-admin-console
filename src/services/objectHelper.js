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
    let _target = {...target}
    let _source = {...source}

    Object.keys(_source)
      .forEach(key => {
        if (isObject(_source[key])) {
          if (!_target[key]) {
            _target[key] = {}
          }

          _target[key] = mergeDeep(_target[key], _source[key])
        } else {
          target[key] = _source[key]
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

/**
 * Count the number of attributes
 * @param mapping
 * @returns number of attributes
 */
export const countAttributes = (mapping, nb = 0) => {
  Object.keys(mapping).forEach(o => {
    if (mapping[o].properties) {
      nb = countAttributes(mapping[o].properties, ++nb)
    } else {
      nb++
    }
  })
  return nb
}
