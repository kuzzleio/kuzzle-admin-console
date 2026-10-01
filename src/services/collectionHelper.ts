export const flattenObjectMapping = (mapping, path = '', level = 1) => {
  let flattenObj = {};

  if (path !== '') {
    path += '.';
  }

  Object.keys(mapping).forEach((attribute) => {
    if (mapping[attribute].properties) {
      flattenObj = {
        ...flattenObj,
        ...flattenObjectMapping(mapping[attribute].properties, path + attribute, level + 1),
      };
    } else {
      flattenObj[path + attribute] = mapping[attribute].type;
    }
  });

  return flattenObj;
};
