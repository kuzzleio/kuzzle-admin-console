export const kuzzleIsConnected = state => {
  return state.kuzzle.connectedTo !== null
}

export const currentEnvironmentId = state => {
  return state.kuzzle.connectedTo
}

export const currentEnvironment = state => {
  if (!environments(state)[currentEnvironmentId(state)]) {
    return null
  }

  return environments(state)[currentEnvironmentId(state)]
}

export const kuzzleHost = state => {
  return state.kuzzle.host
}

export const kuzzlePort = state => {
  return state.kuzzle.port
}

export const environments = state => {
  return state.kuzzle.environments
}
