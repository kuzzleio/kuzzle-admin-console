import { Kuzzle, WebSocket } from 'kuzzle-sdk-v7'
import { KuzzleWrapperV1 } from './kuzzleWrapper-v1'

export const kuzzle = new Kuzzle(new WebSocket('localhost'))

export class KuzzleWrapperV2 extends KuzzleWrapperV1 {
  version: string = '2'

  async connectToEnvironment(environment) {
    // fix default port for users that have an old environment settings in their localStorage:
    if (environment.port === undefined) environment.port = 7512
    if (typeof environment.ssl !== 'boolean') environment.ssl = false

    if (kuzzle.protocol.state === 'connected') {
      this.disconnect()
    }

    kuzzle.protocol = new WebSocket(environment.host, {
      port: parseInt(environment.port),
      sslConnection: environment.ssl
    })

    return kuzzle.connect()
  }
}

export const wrapper = new KuzzleWrapperV2(kuzzle)
