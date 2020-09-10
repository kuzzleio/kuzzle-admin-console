export interface MappingAttributes {
  [path: string]: AttributeProperties
}
export interface AttributeProperties {
  fullPath: string
  type: string
}

export const extractAttributesFromMapping = (
  mapping: object,
  attributes: MappingAttributes = {},
  prefix: string = '',
  path: string[] = []
): MappingAttributes => {
  for (const [name, value] of Object.entries(mapping)) {
    if (value.properties) {
      extractAttributesFromMapping(
        value.properties,
        attributes,
        `${prefix}${name}.`,
        path.concat(name, 'properties')
      )
    } else if (value.type) {
      attributes[`${prefix}${name}`] = {
        type: value.type,
        fullPath: path.concat(name).join('.')
      }
      // Other attribute types are listed in the "fields" property
      if (value.fields) {
        extractAttributesFromMapping(
          value.properties,
          attributes,
          `${prefix}${name}.`,
          path.concat(name, 'fields')
        )
      }
    }
  }
  return attributes
}
