import {
  flattenObjectMapping,
  getDefaultSchemaForType,
  flattenObjectSchema,
  mergeSchemaMapping,
  cleanMapping
} from '../../../services/collectionHelper'
import { CollectionState } from './types'
import { createGetters } from 'direct-vuex'

export const getters = createGetters<CollectionState>()({
  isRealtimeOnly(state) {
    return state.isRealtimeOnly
  },
  flattenMapping(state) {
    return flattenObjectMapping(state.mapping)
  },
  flattenSchema(state) {
    return flattenObjectSchema(state.schema)
  },
  flattenSchemaWithType(state, getters) {
    let schema = {}

    Object.keys(getters.flattenMapping).forEach(attribute => {
      if (getters.flattenSchema && getters.flattenSchema[attribute]) {
        schema[attribute] = { ...getters.flattenSchema[attribute] }
      } else {
        schema[attribute] = {
          ...getDefaultSchemaForType(getters.flattenMapping[attribute])
        }
      }
    })

    return schema
  },
  schemaMappingMerged(state) {
    return mergeSchemaMapping(state.schema, state.mapping)
  },
  simplifiedMapping(state) {
    return cleanMapping(state.mapping)
  }
})
