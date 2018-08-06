export const searchTerm = (state, getters, rootState) => {
  if (
    !rootState.route ||
    !rootState.route.query ||
    !rootState.route.query.searchTerm
  ) {
    return null
  }

  return rootState.route.query.searchTerm
}

/**
 * @param state
 * @returns return the basic filter filled with the route
 */
export const basicFilter = (state, getters, rootState) => {
  if (
    !rootState.route ||
    !rootState.route.query ||
    !rootState.route.query.basicFilter
  ) {
    return null
  }

  try {
    return JSON.parse(rootState.route.query.basicFilter)
  } catch (e) {
    return null
  }
}

/**
 * @param state
 * @returns return the basic filter which is in form basic filter -> the real data from form (and not from url)
 */
export const basicFilterForm = state => {
  return state.basicFilter
}

export const rawFilter = (state, getters, rootState) => {
  if (
    !rootState.route ||
    !rootState.route.query ||
    !rootState.route.query.rawFilter
  ) {
    return null
  }

  try {
    return JSON.parse(rootState.route.query.rawFilter)
  } catch (e) {
    return null
  }
}

export const sorting = (state, getters, rootState) => {
  if (
    !rootState.route ||
    !rootState.route.query ||
    !rootState.route.query.sorting
  ) {
    return null
  }

  try {
    return JSON.parse(rootState.route.query.sorting)
  } catch (e) {
    return []
  }
}

export const paginationFrom = (state, getters, rootState) => {
  if (
    !rootState.route ||
    !rootState.route.query ||
    !rootState.route.query.from
  ) {
    return 0
  }

  return parseInt(rootState.route.query.from) || 0
}

export const paginationSize = (state, getters, rootState) => {
  if (
    !rootState.route ||
    !rootState.route.query ||
    !rootState.route.query.size
  ) {
    return 0
  }

  return parseInt(rootState.route.query.size) || 10
}
