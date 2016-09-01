import Vue from 'vue'

export const getRefMappingFromPath = (mapping, path) => {
  if (path === '') {
    return mapping
  }

  let refMapping = {}
  let splitted = path.split('.').join('.properties.').concat('.properties').split('.')
  // Build an object from a path (path: ['a.b.c.d'] value: 'foo' => {a: {properties: {b: {properties: {c: {properties: {d: 'foo'}}}}}}})
  splitted.reduce((prev, curr, index) => {
    if (!splitted[index + 1]) {
      refMapping = prev[curr]
    }

    return prev[curr]
  }, mapping)

  return refMapping
}

export const getUpdatedSchema = jsonDocument => {
  let type

  if (Array.isArray(jsonDocument)) {
    type = 'array'
  } else {
    type = typeof jsonDocument
  }

  let property
  let properties = {}
  let schema = {}

  if (type === 'object') {
    Object.keys(jsonDocument).forEach(o => {
      property = getUpdatedSchema(jsonDocument[o])
      Vue.set(properties, o, property)
      Vue.set(properties[o], 'val', jsonDocument[o])
    })
    schema = {
      properties: properties,
      type: 'object'
    }
  } else {
    schema = {
      type: type,
      val: jsonDocument
    }
  }
  return schema
}
