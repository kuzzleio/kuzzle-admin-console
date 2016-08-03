export const formatFromQuickSearch = (searchTerm) => {
  if (searchTerm === '' || !searchTerm) {
    return {}
  }

  return {
    query: {
      match_phrase_prefix: {
        _all: {
          query: searchTerm
        }
      }
    }
  }
}

export const formatFromBasicSearch = (groups = [[]]) => {
  let bool = {}

  bool.should = groups.map((filters) => {
    let formattedFilter = {bool: {must: [], must_not: []}}
    filters.forEach((filter) => {
      if (filter.attribute === null) {
        return
      }

      if (filter.operator === 'match') {
        formattedFilter.bool.must.push({
          match_phrase_prefix: {[filter.attribute]: filter.value}
        })
      } else if (filter.operator === 'not_match') {
        formattedFilter.bool.must_not.push({
          match_phrase_prefix: {[filter.attribute]: filter.value}
        })
      } else if (filter.operator === 'equal') {
        formattedFilter.bool.must.push({
          range: {
            [filter.attribute]: {
              gte: filter.value,
              lte: filter.value
            }
          }
        })
      } else if (filter.operator === 'not_equal') {
        formattedFilter.bool.must_not.push({
          range: {
            [filter.attribute]: {
              gte: filter.value,
              lte: filter.value
            }
          }
        })
      }
    })

    return formattedFilter
  })

  if (bool.should.length === 0) {
    return {}
  }

  return {query: {bool}}
}

export const formatPagination = (currentPage, limit) => {
  if (currentPage === undefined || limit === undefined) {
    return {}
  }

  return {
    from: limit * (currentPage - 1),
    size: limit
  }
}

export const formatSort = (sorting) => {
  if (!sorting.attribute) {
    return []
  }

  return [
    {[sorting.attribute]: {order: sorting.order}}
  ]
}
