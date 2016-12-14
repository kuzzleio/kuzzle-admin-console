export const kuzzleIsConnected = state => {
  return state.connectedTo !== null
}

export const currentEnvironmentId = state => {
  return (state.kuzzle ? state.kuzzle.connectedTo : state.connectedTo)
}

export const currentEnvironment = state => {
  if (!environments(state)[currentEnvironmentId(state)]) {
    return null
  }
  return environments(state)[currentEnvironmentId(state)]
}

export const kuzzleHost = state => {
  return (state.kuzzle ? state.kuzzle.host : state.host)
}

export const kuzzlePort = state => {
  return (state.kuzzle ? state.kuzzle.port : state.port)
}

export const environments = state => {
  return (state.kuzzle ? state.kuzzle.environments : state.environments)
}
