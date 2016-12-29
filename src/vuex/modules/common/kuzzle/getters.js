export const kuzzleIsConnected = state => {
  return state.connectedTo !== null
}

export const currentEnvironmentId = state => {
  return state.connectedTo
}

export const currentEnvironment = (state, getters) => {
  if (!state.environments[getters.currentEnvironmentId]) {
    return null
  }
  return state.environments[getters.currentEnvironmentId]
}

export const kuzzleHost = state => {
  return state.host
}

export const kuzzlePort = state => {
  return state.port
}
