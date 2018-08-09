import _ from 'lodash'
// TODO take everything out of the class
class FilterManager {
  load(index, collection, store) {
    if (!index || !collection) {
      throw new Error(
        'Cannot load filters if no index or collection are specfied'
      )
    }

    let loadedFilterRoute = this.loadFromRoute(store)
    let loadedFilterLS = this.loadFromLocalStorage(index, collection)

    // We merge the two filters giving priority to the ones read from
    // the route.
    let loadedFilter = Object.assign(
      new Filter(),
      loadedFilterLS,
      loadedFilterRoute
    )

    return loadedFilter
  }

  // TODO store -> route
  loadFromRoute(store) {
    if (!store) {
      throw new Error('No store specified')
    }

    let filter = Object.assign({}, store.state.route.query)

    if (filter.raw && typeof filter.raw === 'string') {
      filter.raw = JSON.parse(filter.raw)
    }
    if (filter.sorting && typeof filter.sorting === 'string') {
      filter.sorting = JSON.parse(filter.sorting)
    }
    if (filter.basic && typeof filter.basic === 'string') {
      filter.basic = JSON.parse(filter.basic)
    }

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

    return {}
  }

  save(filter, router, index, collection) {
    if (!index || !collection) {
      throw new Error(
        'Cannot save filters if no index or collection are specfied'
      )
    }
    const strippedFilter = stripDefaultValuesFromFilter(filter)
    this.saveToRouter(strippedFilter, router)
    this.saveToLocalStorage(strippedFilter, index, collection)
  }

  saveToRouter(filter, router) {
    const formattedFilter = Object.assign({}, filter)
    if (filter.basic) {
      formattedFilter.basic = JSON.stringify(filter.basic)
    }
    if (filter.raw) {
      formattedFilter.raw = JSON.stringify(filter.raw)
    }
    if (filter.sorting) {
      formattedFilter.sorting = JSON.stringify(filter.sorting)
    }
    router.push({ query: formattedFilter })
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
    if (!filter) {
      throw new Error('No filter specified')
    }

    switch (filter.active) {
      case ACTIVE_QUICK:
        return filter.quick ? formatFromQuickSearch(filter.quick) : {}
      case ACTIVE_BASIC:
        return filter.basic ? formatFromBasicSearch(filter.basic) : {}
      case ACTIVE_RAW:
        return filter.raw || {}
      case NO_ACTIVE:
      default:
        return {}
    }
  }

  toRealtimeQuery(filter) {
    if (!filter) {
      throw new Error('No filter specified')
    }

    switch (filter.active) {
      case ACTIVE_BASIC:
        return filter.basic ? basicFilterToRealtimeQuery(filter.basic) : {}
      case ACTIVE_RAW:
        return filter.raw || {}
      case ACTIVE_QUICK:
      case NO_ACTIVE:
      default:
        return {}
    }
  }
}

// TODO avoid dependency on global defaultFilter
export function isDefaultFilterValue(key, value) {
  return _.isEqual(defaultFilter[key], value)
}

export const stripDefaultValuesFromFilter = filter => {
  let strippedFilter = {}
  Object.keys(filter).forEach(key => {
    if (isDefaultFilterValue(key, filter[key])) {
      return
    }
    strippedFilter[key] = filter[key]
  })
  return strippedFilter
}

export const NO_ACTIVE = null
export const ACTIVE_QUICK = 'quick'
export const ACTIVE_BASIC = 'basic'
export const ACTIVE_RAW = 'raw'
export const SORT_ASC = 'asc'
export const SORT_DESC = 'desc'
export const DEFAULT_QUICK = ''

export function Filter() {
  this.active = NO_ACTIVE
  this.quick = DEFAULT_QUICK
  this.basic = null
  this.raw = null
  this.sorting = null
  this.from = 0
}

// TODO no this
const defaultFilter = new Filter()

// TODO no this
export const filterManager = new FilterManager()

export const searchFilterOperands = {
  match: 'Match',
  not_match: 'Not Match',
  equal: 'Equal',
  not_equal: 'Not equal'
}

export const realtimeFilterOperands = {
  match: 'Match',
  not_match: 'Not Match',
  regexp: 'Regexp',
  exists: 'Exists',
  missing: 'Missing'
}

export const basicFilterToRealtimeQuery = (groups = [[]]) => {
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

// TODO rename to basicFilterToSearchQuery
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
