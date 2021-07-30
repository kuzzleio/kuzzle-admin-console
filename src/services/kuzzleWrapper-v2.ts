// import { Kuzzle, WebSocket } from 'kuzzle-sdk-v7'
import { Kuzzle, WebSocket } from 'kuzzle-sdk-v7' ;
import { KuzzleWrapperV1 } from './kuzzleWrapper-v1' ;

// NOTE - We instantiate a new Kuzzle SDK with Websocket protocol
// pointing to `localhost` because we cannot instantiate the `WebSocket`
// class with `null` argument. The SDK will not initiate a connection to
// `localhost` as the call to `connect()` is performed in the `connectToEnvironment`
// method, which instantiates a new `WebSocket` class with the hostname
// corresponding to the selected environment.
export const kuzzle = new Kuzzle(new WebSocket('localhost'))

export class KuzzleWrapperV2 extends KuzzleWrapperV1 {
  version: string = '2'

  async connectToEnvironment(environment) {
    // fix default port for users that have an old environment settings in their localStorage:
    if (environment.port === undefined) environment.port = 7512 ;
    if (typeof environment.ssl !== 'boolean') environment.ssl = false ;

    if (kuzzle.protocol.state === 'connected') {
      this.disconnect()
    }

    kuzzle.protocol = new WebSocket(environment.host, {
      port: parseInt(environment.port),
      sslConnection: environment.ssl
    }) ;

    return kuzzle.connect()
  }

  async getMappingDocument(collection, index, includeKuzzleMeta = true) {
    // @todo Use the SDK method after
    // https://github.com/kuzzleio/sdk-javascript/pull/507 is merged
    const request = {
      controller: 'collection',
      action: 'getMapping',
      index,
      collection,
      includeKuzzleMeta
    } ;

    const response = await this.kuzzle.query(request)

    return response.result ;
  }

  quickSearchToESQuery(searchTerm): object {
    if (!searchTerm) {
      return {} ;
    }

    return {
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: searchTerm,
                type: 'phrase_prefix',
                fields: ['*']
              }
            },
            {
              match: {
                _id: searchTerm
              }
            }
          ]
        }
      }
    } ;
  }

  performCreateUser(kuid, body) {
    return this.kuzzle.security.createUser(kuid, body)
  }

  performReplaceUser(kuid, body) {
    return this.kuzzle.security.replaceUser(kuid, body)
  }
}

export const wrapper = new KuzzleWrapperV2(kuzzle)
