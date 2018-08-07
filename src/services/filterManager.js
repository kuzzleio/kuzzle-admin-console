class FilterManager {
  load(index, collection, store) {
    if (!index || !collection) {
      throw new Error(
        'Cannot load filters if no index or collection are specfied'
      )
    }
    console.log('Loading filters...')
    let loadedFilter = this.loadFromRoute(store)

    if (loadedFilter.active === NO_ACTIVE) {
      console.log('nothing found in URL, looking in LocalStorage')
      loadedFilter = this.loadFromLocalStorage(index, collection)
    }

    return loadedFilter
  }

  loadFromRoute(store) {
    let filter = new Filter()

    if (store.state.route.query.searchTerm) {
      console.log('found searchTerm in route')
      filter.quick = store.state.route.query.searchTerm
      filter.active = ACTIVE_QUICK
    } else if (store.state.route.query.basicFilter) {
      filter.quick = store.state.route.query.basicFilter
      filter.active = ACTIVE_BASIC
    } else if (store.state.route.query.rawFilter) {
      filter.quick = store.state.route.query.rawFilter
      filter.active = ACTIVE_RAW
    }

    console.log('filters found in route')
    console.log(filter)

    return filter
  }

  loadFromLocalStorage(index, collection) {
    if (!index || !collection) {
      throw new Error(
        'Cannot load filters from localstorage if no index or collection are specfied'
      )
    }
    const filterStr = localStorage.getItem(
      `search-filter-current:${index}/${collection}`
    )
    if (filterStr) {
      return JSON.parse(filterStr)
    }

    return new Filter()
  }

  save(filter, router, index, collection) {
    if (!index || !collection) {
      throw new Error(
        'Cannot save filters if no index or collection are specfied'
      )
    }
    this.saveToRouter(filter, router)
    this.saveToLocalStorage(filter, index, collection)
  }

  saveToRouter(filter, router) {
    switch (filter.active) {
      case ACTIVE_QUICK:
        router.push({ query: { searchTerm: filter.quick, from: 0 } })
        break
      case NO_ACTIVE:
      default:
        router.push({ query: {} })
        break

      // TODO other cases...
    }
  }

  saveToLocalStorage(filter, index, collection) {
    if (!index || !collection) {
      throw new Error(
        'Cannot save filters to localstorage if no index or collection are specfied'
      )
    }
    localStorage.setItem(
      `search-filter-current:${index}/${collection}`,
      JSON.stringify(filter)
    )
  }

  toSearchQuery(filter) {
    switch (filter.active) {
      case ACTIVE_QUICK:
        return this.quickFilterToSearchQuery(filter.quick)
      case ACTIVE_BASIC:
        return this.basicFilterToSearchQuery(filter.basic)
      case ACTIVE_RAW:
        return this.rawFilterToSearchQuery()
      case NO_ACTIVE:
      default:
        return this.emptyFilterToSearchQuery()
    }
  }

  quickFilterToSearchQuery(quickFilter) {
    if (!quickFilter) {
      return this.emptyFilterToSearchQuery()
    }

    return formatFromQuickSearch(quickFilter)
  }
  basicFilterToSearchQuery(basicFilter) {
    if (!basicFilter) {
      return this.emptyFilterToSearchQuery()
    }

    return formatFromBasicSearch(basicFilter)
  }
  rawFilterToSearchQuery() {}
  emptyFilterToSearchQuery() {
    return {}
  }
}

export const NO_ACTIVE = null
export const ACTIVE_QUICK = 'quick'
export const ACTIVE_BASIC = 'basic'
export const ACTIVE_RAW = 'raw'

export function Filter() {
  this.active = NO_ACTIVE
  this.quick = ''
  this.basic = []
  this.raw = {}
}

export const filterManager = new FilterManager()

export const availableFilters = {
  // FIXME: rename to available operands
  match: 'Match',
  not_match: 'Not Match',
  equal: 'Equal',
  not_equal: 'Not equal'
}

export const formatFromQuickSearch = searchTerm => {
  if (searchTerm === '' || !searchTerm) {
    return {}
  }

  return {
    query: {
      bool: {
        should: [
          {
            match_phrase_prefix: {
              _all: {
                query: searchTerm
              }
            }
          },
          {
            match: {
              _id: searchTerm
            }
          }
        ]
      }
    }
  }
}

export const formatFromBasicSearch = (groups = [[]]) => {
  let bool = {}

  bool.should = groups.map(filters => {
    let formattedFilter = { bool: { must: [], must_not: [] } }
    filters.forEach(filter => {
      if (filter.attribute === null) {
        return
      }

      if (filter.operator === 'match') {
        formattedFilter.bool.must.push({
          match_phrase_prefix: { [filter.attribute]: filter.value }
        })
      } else if (filter.operator === 'not_match') {
        formattedFilter.bool.must_not.push({
          match_phrase_prefix: { [filter.attribute]: filter.value }
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

  return { query: { bool } }
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

export const formatSort = sorting => {
  if (!sorting.attribute) {
    return []
  }

  return [{ [sorting.attribute]: { order: sorting.order } }]
}
