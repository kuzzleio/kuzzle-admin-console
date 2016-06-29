export const isAuthenticated = state => {
  return state.auth.user != null
}
