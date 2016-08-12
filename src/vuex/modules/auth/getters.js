export const isAuthenticated = state => {
  return state.auth.user.id !== undefined
}

export const user = state => {
  return state.auth.user
}

export const tokenValid = state => {
  return state.auth.tokenValid
}

export const adminAlreadyExists = state => {
  return state.auth.adminAlreadyExists
}
