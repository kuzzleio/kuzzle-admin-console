import {flattenObjectMapping, getDefaultSchemaForType, flattenObjectSchema} from '../../../services/collectionHelper'

export const isRealtimeOnly = state => {
  return state.isRealtimeOnly
}

export const flattenMapping = state => {
  return flattenObjectMapping(state.mapping)
}

export const flattenSchema = state => {
  return flattenObjectSchema(state.schema)
}

export const flattenSchemaWithType = (state, getters) => {
  let schema = {}
  Object.keys(getters.flattenMapping).forEach(attribute => {
    if (getters.flattenSchema && getters.flattenSchema[attribute]) {
      schema[attribute] = {...getters.flattenSchema[attribute]}
    } else {
      schema[attribute] = {...getDefaultSchemaForType(getters.flattenSchema[attribute])}
    }
  })

  return schema
}
