import _ from 'lodash'

export const NO_ACTIVE = null
export const ACTIVE_QUICK = 'quick'
export const ACTIVE_BASIC = 'basic'
export const ACTIVE_RAW = 'raw'
export const SORT_ASC = 'asc'
export const SORT_DESC = 'desc'
export const DEFAULT_QUICK = ''

const DEFAULT_FILTER = {
  '_kuzzle_info.createdAt': 'desc'
}

export function Filter(this: any) {
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
  contains: 'Contains',
  not_contains: 'Not Contains',
  equal: 'Equal',
  not_equal: 'Not equal',
  range: 'Range',
  exists: 'Exists',
  not_exists: 'Not exists'
}

export const realtimeFilterOperands = {
  contains: 'contains',
  not_contains: 'Not Contains',
  regexp: 'Regexp',
  exists: 'Exists',
  missing: 'Missing'
}

export const basicFilterToRealtimeQuery = (groups = [[]]) => {
  let or: any = []

  groups.forEach(function(filters) {
    let and = filters
      .filter((filter: any) => {
        return filter.attribute !== null
      })
      .map(function(filter: any) {
        switch (filter.operator) {
          case 'contains':
            return { equals: { [filter.attribute]: filter.value } }
          case 'not_contains':
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
            multi_match: {
              query: searchTerm,
              type: 'phrase_prefix',
              fields: ['*']
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
    return null
  }

  if (rawFilter._source && rawFilter._source.indexOf('_kuzzle_info') === -1) {
    rawFilter._source.push('_kuzzle_info')
  }

  return rawFilter
}

export const toSort = filter => {
  switch (filter.active) {
    case ACTIVE_QUICK:
      return DEFAULT_FILTER
    case ACTIVE_RAW:
      return filter.raw ? rawFilterToSort(filter.raw) : DEFAULT_FILTER
    case NO_ACTIVE:
    default:
    case ACTIVE_BASIC:
      return filter.sorting ? formatSort(filter.sorting) : DEFAULT_FILTER
  }
}

export const rawFilterToSort = rawFilter => {
  return rawFilter.sort || DEFAULT_FILTER
}

export const formatSort = sorting => {
  if (!sorting.attribute) {
    return DEFAULT_FILTER
  }
  return [{ [sorting.attribute]: { order: sorting.order } }]
}

// TODO rename to basicFilterToSearchQuery
export const formatFromBasicSearch = (groups = [[]]) => {
  let bool: any = {}

  bool.should = groups.map(filters => {
    let formattedFilter: any = { bool: { must: [], must_not: [] } }
    filters.forEach((filter: any) => {
      if (filter.attribute === null) {
        return
      }

      if (filter.operator === 'contains') {
        formattedFilter.bool.must.push({
          regexp: { [filter.attribute]: '.*' + filter.value + '.*' }
        })
      } else if (filter.operator === 'not_contains') {
        formattedFilter.bool.must_not.push({
          regexp: { [filter.attribute]: '.*' + filter.value + '.*' }
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
      } else if (filter.operator === 'exists') {
        const exists = {
          exists: {
            field: filter.attribute
          }
        }
        formattedFilter.bool.must.push(exists)
      } else if (filter.operator === 'not_exists') {
        const exists = {
          exists: {
            field: filter.attribute
          }
        }
        formattedFilter.bool.must_not.push(exists)
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
