export const kuzzleIsConnected = state => {
  return state.kuzzle.connectedTo !== null
}

export const connectedTo = state => {
  return state.kuzzle.connectedTo
}

export const currentEnvironment = state => {
  if (!environments(state)[connectedTo(state)]) {
    return null
  }

  return environments(state)[connectedTo(state)]
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
