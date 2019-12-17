export const isAuthenticated = state => {
  return !!state.user.id
}

export const user = state => {
  return state.user
}

export const tokenValid = state => {
  return state.tokenValid
}

export const adminAlreadyExists = state => {
  return state.adminAlreadyExists
}
