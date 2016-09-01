import Vue from 'vue'

export const addAttributeFromPath = (mapping, path, attr, content) => {
  if (path === '/') {
    Vue.set(mapping, attr, content)
    return
  }
  let splitted = path.split('.').join('.properties.').concat('.properties').split('.')
  // Build an object from a path (path: ['a.b.c.d'] value: 'foo' => {a: {properties: {b: {properties: {c: {properties: {d: 'foo'}}}}}}})
  splitted.reduce((prev, curr, index) => {
    if (!splitted[index + 1]) {
      Vue.set(prev[curr], attr, content)
    }
    return prev[curr]
  }, mapping)
}

export const getUpdatedSchema = (jsonDocument, collection) => {
  let type
  if (Array.isArray(jsonDocument)) {
    if (collection === 'users') {
      type = 'profileIds'
    } else {
      type = 'array'
    }
  } else {
    type = typeof jsonDocument
  }

  let property
  let properties = {}
  let schema = {}

  if (type === 'object') {
    Object.keys(jsonDocument).forEach(o => {
      property = getUpdatedSchema(jsonDocument[o], collection)
      if (o !== '_id') {
        Vue.set(properties, o, property)
        Vue.set(properties[o], 'val', jsonDocument[o])
      }
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
