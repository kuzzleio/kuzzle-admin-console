import _ from 'lodash'

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
  this.size = 10
}

const LOCALSTORAGE_PREFIX = 'search-filter-current'

export const load = (index, collection, route) => {
  if (!index || !collection) {
    throw new Error(
      'Cannot load filters if no index or collection are specified'
    )
  }

  let loadedFilterRoute = loadFromRoute(route)
  let loadedFilterLS = loadFromLocalStorage(index, collection)

  // We merge the two filters giving priority to the ones read from
  // the route.
  let loadedFilter = Object.assign(
    new Filter(),
    loadedFilterLS,
    loadedFilterRoute
  )

  return loadedFilter
}

export const loadFromRoute = route => {
  if (!route) {
    throw new Error('No store specified')
  }

  const emptyFilter = new Filter()

  let filter = _.pick(route.query, Object.keys(emptyFilter)) // Object.assign({}, route.query)

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

export const loadFromLocalStorage = (index, collection) => {
  if (!index || !collection) {
    throw new Error(
      'Cannot load filters from localstorage if no index or collection are specified'
    )
  }
  const filterStr = localStorage.getItem(
    `${LOCALSTORAGE_PREFIX}:${index}/${collection}`
  )
  if (filterStr) {
    return JSON.parse(filterStr)
  }

  return {}
}

export const save = (filter, router, index, collection) => {
  if (!index || !collection) {
    throw new Error(
      'Cannot save filters if no index or collection are specified'
    )
  }
  const strippedFilter = stripDefaultValuesFromFilter(filter)
  saveToRouter(strippedFilter, router)
  saveToLocalStorage(strippedFilter, index, collection)
}

export const saveToRouter = (filter, router) => {
  const emptyFilter = new Filter()
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

  const otherQueryParams = _.omit(
    router.currentRoute.query,
    Object.keys(emptyFilter)
  )
  const mergedQuery = _.merge(formattedFilter, otherQueryParams)

  router.push({ query: mergedQuery }).catch(() => {})
}

export const saveToLocalStorage = (filter, index, collection) => {
  if (!index || !collection) {
    throw new Error(
      'Cannot save filters to localstorage if no index or collection are specified'
    )
  }
  localStorage.setItem(
    `${LOCALSTORAGE_PREFIX}:${index}/${collection}`,
    JSON.stringify(filter)
  )
}

export const toSearchQuery = filter => {
  if (!filter) {
    throw new Error('No filter specified')
  }

  switch (filter.active) {
    case ACTIVE_QUICK:
      return filter.quick ? formatFromQuickSearch(filter.quick) : {}
    case ACTIVE_BASIC:
      return filter.basic ? formatFromBasicSearch(filter.basic) : {}
    case ACTIVE_RAW:
      return filter.raw ? rawFilterToSearchQuery(filter.raw) : {}
    case NO_ACTIVE:
    default:
      return {}
  }
}

export const toRealtimeQuery = filter => {
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

export const stripDefaultValuesFromFilter = filter => {
  const defaultFilter = new Filter()
  let strippedFilter = {}
  Object.keys(filter).forEach(key => {
    if (_.isEqual(defaultFilter[key], filter[key])) {
      return
    }
    strippedFilter[key] = filter[key]
  })
  return strippedFilter
}

export const searchFilterOperands = {
  match: 'Match',
  not_match: 'Not Match',
  equal: 'Equal',
  not_equal: 'Not equal',
  range: 'Range'
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

export const rawFilterToSearchQuery = rawFilter => {
  if (!rawFilter.query) {
    throw new Error('The filter is malformed: "query" attribute not found')
  }

  if (rawFilter._source && rawFilter._source.indexOf('_kuzzle_info') === -1) {
    rawFilter._source.push('_kuzzle_info')
  }

  return rawFilter
}

export const toSort = filter => {
  switch (filter.active) {
    case ACTIVE_QUICK:
      return ['_uid']
    case ACTIVE_RAW:
      return filter.raw ? rawFilterToSort(filter.raw) : ['_uid']
    case NO_ACTIVE:
    default:
    case ACTIVE_BASIC:
      return filter.sorting ? formatSort(filter.sorting) : ['_uid']
  }
}

export const rawFilterToSort = rawFilter => {
  return rawFilter.sort || ['_uid']
}

export const formatSort = sorting => {
  if (!sorting.attribute) {
    return ['_uid']
  }
  return [{ [sorting.attribute]: { order: sorting.order } }]
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
      } else if (filter.operator === 'range') {
        const range = { range: {} }
        if (filter.gt_value && filter.lt_value) {
          range.range = {
            [filter.attribute]: {
              gt: filter.gt_value,
              lt: filter.lt_value
            }
          }
        } else if (filter.gt_value && !filter.lt_value) {
          range.range = {
            [filter.attribute]: {
              gt: filter.gt_value
            }
          }
        } else {
          range.range = {
            [filter.attribute]: {
              lt: filter.lt_value
            }
          }
        }
        formattedFilter.bool.must.push(range)
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
