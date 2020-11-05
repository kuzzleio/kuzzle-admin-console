import _ from 'lodash'

export const typesCorrespondance = {
  binary: 'input',
  boolean: 'checkbox',
  integer: 'input',
  long: 'input',
  short: 'input',
  byte: 'input',
  double: 'input',
  float: 'input',
  half_float: 'input',
  scaled_float: 'input',
  keyword: 'input',
  wildcard: 'input',
  constant_keyword: 'input',
  date: 'input',
  text: 'textArea',
  search_as_you_type: 'textArea',
  object: 'JsonFormInput',
  flattened: 'JsonFormInput',
  geo_point: 'JsonFormInput',
  geo_shape: 'JsonFormInput',
  histogram: 'JsonFormInput',
  percolator: 'JsonFormInput',
  point: 'JsonFormInput',
  integer_range: 'JsonFormInput',
  float_range: 'JsonFormInput',
  long_range: 'JsonFormInput',
  double_range: 'JsonFormInput',
  date_range: 'JsonFormInput',
  ip_range: 'JsonFormInput',
  rank_feature: 'JsonFormInput',
  rank_features: 'JsonFormInput',
  shape: 'JsonFormInput',
  sparse_vector: 'JsonFormInput',
  ip: 'input',
  nested: 'JsonFormInput',
  join: 'JsonFormInput'
}

const inputTypesCorrespondance = {
  binary: 'text',
  ip: 'text',
  integer: 'number',
  long: 'number',
  short: 'number',
  byte: 'number',
  double: 'number',
  float: 'number',
  half_float: 'number',
  scaled_float: 'number',
  keyword: 'text',
  wildcard: 'text',
  constant_keyword: 'text',
  Numbers: 'number',
  date: 'date'
}

export const mappingToFormSchema = function(mapping: Object, document: Object) {
  const schema: Schema = {
    fields: [],
    unavailables: []
  }

  const fieldsToRemove = ['_kuzzle_info']
  const cleanedMapping = _.omit(mapping, fieldsToRemove)

  Object.entries(cleanedMapping).forEach(
    ([mappingFieldName, mappingFieldValues]: [string, any]) => {
      const type = mappingFieldValues['properties']
        ? 'object'
        : mappingFieldValues['type']

      if (!Object.keys(typesCorrespondance).includes(type)) {
        schema.unavailables.push(mappingFieldName)
        return
      }

      if (Array.isArray(document[mappingFieldName])) {
        schema.unavailables.push(mappingFieldName)
        return
      }

      const field: FormField = {
        type: _getTypeCorrespondance(type),
        inputType: _getInputTypeCorrespondance(type),
        label: mappingFieldName,
        model: mappingFieldName
      }

      schema.fields.push(field)
    }
  )

  return schema
}

const _getTypeCorrespondance = function(mappingType: string) {
  return typesCorrespondance[mappingType]
}

const _getInputTypeCorrespondance = function(mappingType: string) {
  return inputTypesCorrespondance[mappingType] || null
}

interface FormField {
  type: string
  inputType: string
  label: string
  model: string
}

interface Schema {
  fields: FormField[]
  unavailables: string[]
}
