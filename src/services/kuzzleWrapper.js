import kuzzle from './kuzzle'

export const isConnected = (timeout = 1000) => {
  if (kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      let id = kuzzle.addListener('connected', () => {
        kuzzle.removeListener('connected', id)
        resolve()
      })

      // Timeout, if kuzzle doesn't respond in 1s (default) -> reject
      setTimeout(() => {
        kuzzle.removeListener('connected', id)
        reject()
      }, timeout)
    })
  }

  return Promise.resolve()
}
