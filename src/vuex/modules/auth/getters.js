export const isAuthenticated = state => {
  return state.auth.user != null
}

export const adminAlreadyExists = state => {
  return state.auth.adminAlreadyExists
}
