export const antiGlitchOverlayTimeout = 900;
export const LS_ENVIRONMENTS = 'environments';
export const SS_CURRENT_ENV = 'currentEnv';

export const formatForDom = word => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
}

export const sortObject = (object) => {
  return Object.keys(object)
    .sort()
    .reduce((result, key) => {
      result[key] = object[key]
      return result
    }, {})
}

export const truncateName = (name, maxLength = 50) => {
  if (!name) {
    return ''
  }
  if (name.length <= maxLength) {
    return name
  }
  if (name.length > maxLength) {
    return `${name.substring(0, maxLength)}...`
  }
}

export const dateFromTimestamp = (value) => {
  let timestamp

  if (typeof value === 'string') {
    if (!isNaN(Date.parse(value))) {
      timestamp = Date.parse(value)
    } else {
      timestamp = parseInt(value, 10)
    }

    if (isNaN(timestamp)) {
      return null
    }
  } else if (Number.isInteger(value)) {
    timestamp = value
  } else {
    return null
  }

  const length = `${timestamp}`.length

  let date
  if (length === 10) {
    date = new Date(timestamp * 1000)
  } else if (length === 13) {
    date = new Date(timestamp)
  } else {
    return null
  }

  return date
}

export const wait = async ms =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  });
