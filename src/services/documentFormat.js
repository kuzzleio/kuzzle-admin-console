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

export const getUpdatedSchema = (jsonDocument, collection) => {
  let type
  if (Array.isArray(jsonDocument)) {
    if (collection === 'users') {
      type = 'profileIds'
    } else {
      type = 'array'
    }
  } else {
    if (typeof jsonDocument === 'string') {
      type = 'text'
    }

    type = typeof jsonDocument
  }

  let property
  let properties = {}
  let schema = {}

  if ((type === 'object' && jsonDocument != null) || type === 'nested') {
    Object.keys(jsonDocument).forEach(o => {
      property = getUpdatedSchema(jsonDocument[o], collection)
      if (o !== '_id') {
        Vue.set(properties, o, property)
        Vue.set(properties[o], 'val', jsonDocument[o])
      }
    })
    schema = {
      properties: properties,
      type
    }
  } else {
    schema = {
      val: jsonDocument,
      type
    }
  }

  return schema
}

export const cleanMapping = (mapping) => {
  let _mapping = {...mapping}

  Object.keys(_mapping).forEach(o => {
    if (_mapping[o].properties) {
      _mapping[o].properties = cleanMapping(_mapping[o].properties)
    } else {
      delete _mapping[o].val
    }
  })

  return _mapping
}
