import cookie from '../services/cookies'

export class SessionUser {
  constructor (id, token, params, rights) {
    this.id = id
    this.token = token
    this.params = params || {}
    this.rights = rights || {}
  }

  store () {
    cookie.set(this)
  }

  static reset () {
    cookie.delete()
  }

  restore () {
    let user = cookie.get()

    if (user) {
      Object.assign(this, user)
      return this
    }

    return null
  }
}
