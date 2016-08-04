import Kuzzle from 'kuzzle-sdk'
import config from '../../config'
import Promise from 'bluebird'

let kuzzle = Kuzzle(`http://${config.backend.host}:${config.backend.port}`)
kuzzle.bluebird = Promise

export default kuzzle
