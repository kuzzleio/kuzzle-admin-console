export const availableFilters = {
  match: 'Match',
  not_match: 'Not Match',
  regexp: 'Regexp',
  exists: 'Exists',
  missing: 'Missing'
}

export const formatFromBasicSearch = (groups = [[]]) => {
  let or = []

  groups.forEach(function (filters) {
    let and = filters.map(function (filter) {
      if (filter.attribute === null) {
        return
      }

      switch (filter.operator) {
        case 'match':
          return {term: {[filter.attribute]: filter.value}}
        case 'not_match':
          return {not: {term: {[filter.attribute]: filter.value}}}
        case 'regexp':
          return {regexp: {[filter.attribute]: filter.value}}
        case 'exists':
          return {exists: {field: filter.attribute}}
        case 'missing':
          return {missing: {field: filter.attribute}}
      }
    })

    or.push({and})
  })

  if (or.length === 0) {
    return {}
  }

  return {or}
}
