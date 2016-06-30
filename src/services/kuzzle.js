import Kuzzle from 'kuzzle-sdk'
import config from '../../config'

export default new Kuzzle(`http://${config.backend.host}:${config.backend.port}`)
