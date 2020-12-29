import _ from 'lodash'
import { MappingAttributes } from './mappingHelpers'

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
const HISTORY_LOCALSTORAGE_PREFIX = 'history-filter'
const FAVORIS_LOCALSTORAGE_PREFIX = 'favoris-filter'

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

export const saveFavoritesToLocalStorage = (filters, index, collection) => {
  localStorage.setItem(
    `${FAVORIS_LOCALSTORAGE_PREFIX}:${index}/${collection}`,
    JSON.stringify(filters)
  )
}

export const loadFavoritesFromLocalStorage = (index, collection) => {
  if (!index || !collection) {
    throw new Error(
      'Cannot load filters from localstorage if no index or collection are specified'
    )
  }
  const filterStr = localStorage.getItem(
    `${FAVORIS_LOCALSTORAGE_PREFIX}:${index}/${collection}`
  )
  if (filterStr) {
    return JSON.parse(filterStr)
  }
  return []
}

export const saveHistoyToLocalStorage = (filters, index, collection) => {
  localStorage.setItem(
    `${HISTORY_LOCALSTORAGE_PREFIX}:${index}/${collection}`,
    JSON.stringify(filters)
  )
}

export const addNewHistoryItemAndSave = (filter, index, collection) => {
  if (!index || !collection) {
    throw new Error(
      'Cannot save filters to localstorage if no index or collection are specified'
    )
  }
  if (filter.active === null) {
    return
  }
  const filters = loadHistoyFromLocalStorage(index, collection)
  const date = new Date(Date.now())
  filter.name =
    date.getDate() +
    '/' +
    date.getMonth() +
    '/' +
    date.getFullYear() +
    ' ' +
    date.getHours() +
    ':' +
    date.getMinutes()
  filter.id = Date.now()
  if (filters.length >= 10) {
    filters.shift()
  }
  filters.push(filter)
  saveHistoyToLocalStorage(filters, index, collection)
}

export const loadHistoyFromLocalStorage = (index, collection) => {
  if (!index || !collection) {
    throw new Error(
      'Cannot load filters from localstorage if no index or collection are specified'
    )
  }
  const filterStr = localStorage.getItem(
    `${HISTORY_LOCALSTORAGE_PREFIX}:${index}/${collection}`
  )
  if (filterStr) {
    return JSON.parse(filterStr)
  }

  return []
}

export const toSearchQuery = (
  filter,
  mappingAttributes: MappingAttributes,
  kuzzleWrapper
) => {
  if (!filter) {
    throw new Error('No filter specified')
  }

  if (!kuzzleWrapper) {
    throw new Error('No Kuzzle Wrapper specified')
  }

  switch (filter.active) {
    case ACTIVE_QUICK:
      return filter.quick
        ? kuzzleWrapper.quickSearchToESQuery(filter.quick)
        : {}
    case ACTIVE_BASIC:
      return filter.basic
        ? kuzzleWrapper.basicSearchToESQuery(filter.basic, mappingAttributes)
        : {}
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

export const formatPagination = (currentPage, limit) => {
  if (currentPage === undefined || limit === undefined) {
    return {}
  }

  return {
    from: limit * (currentPage - 1),
    size: limit
  }
}
