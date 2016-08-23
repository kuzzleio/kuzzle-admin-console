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

export const getUpdatedSchema = jsonDocument => {
  let type = typeof jsonDocument
  let property
  let properties = {}
  let schema = {}

  if (type === 'object') {
    Object.keys(jsonDocument).forEach(o => {
      property = getUpdatedSchema(jsonDocument[o])
      properties[o] = property
      properties[o].val = jsonDocument[o]
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
