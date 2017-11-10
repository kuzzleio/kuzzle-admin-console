import Kuzzle from 'kuzzle-sdk/dist/kuzzle'
import Promise from 'bluebird'
Kuzzle.prototype.bluebird = Promise
