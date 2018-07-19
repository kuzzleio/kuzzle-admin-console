export const availableFilters = {
  match: 'Match',
  not_match: 'Not Match',
  regexp: 'Regexp',
  exists: 'Exists',
  missing: 'Missing'
}

export const formatFromBasicSearch = (groups = [[]]) => {
  let or = []

  groups.forEach(function(filters) {
    let and = filters
      .filter(filter => {
        return filter.attribute !== null
      })
      .map(function(filter) {
        switch (filter.operator) {
          case 'match':
            return { equals: { [filter.attribute]: filter.value } }
          case 'not_match':
            return { not: { equals: { [filter.attribute]: filter.value } } }
          case 'regexp':
            return { regexp: { [filter.attribute]: filter.value } }
          case 'exists':
            return { exists: { field: filter.attribute } }
          case 'missing':
            return { missing: { field: filter.attribute } }
        }
      })

    or.push({ and })
  })

  if (or.length === 0) {
    return {}
  }

  return { or }
}
