export const isAuthenticated = state => {
  return state.auth.user != null
}

export const user = state => {
  return state.auth.user
}

export const tokenValid = state => {
  return state.auth.tokenValid
}
