import kuzzle from './kuzzle'

export const isConnected = () => {
  if (kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      let id = kuzzle.addListener('connected', () => {
        kuzzle.removeListener('connected', id)
        resolve()
      })

      // Timeout, if kuzzle doesn't respond in 10s -> reject
      setTimeout(() => {
        kuzzle.removeListener('connected', id)
        reject()
      }, 10000)
    })
  }

  return Promise.resolve()
}
