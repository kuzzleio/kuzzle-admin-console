export const isAuthenticated = state => {
  return state.auth.user != null
}

export const getError = state => {
  return state.common.error
}
