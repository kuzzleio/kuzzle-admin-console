import trim from 'lodash/trim'
import { envColors } from './vuex/modules/kuzzle/store'

export const startsWithSpace = value => {
  return value[0] === ' '
}

export const isWhitespace = value => {
  return trim(value) === ''
}
export const isValidHostname = value => {
  return /^@$|^(\*)$|^(\*\.)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9](\.?))$/.test(
    value
  )
}
export const notIncludeScheme = value => {
  return !/^(http|ws):\/\//.test(value)
}
export const isUppercase = value => {
  return /[A-Z]/.test(value)
}
export const isValidEnvironment = env => {
  if (
    !env.name ||
    !env.host ||
    !env.port ||
    !env.backendMajorVersion ||
    typeof env.port !== 'number' ||
    env.ssl === undefined ||
    env.ssl === null ||
    !env.color ||
    !envColors.includes(env.color)
  ) {
    return false
  }
  return true
}
