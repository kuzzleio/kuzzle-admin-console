import kuzzle from '../../../services/kuzzle'

export const deleteUser = (store, user) => {
  if (!user.id) {
    return
  }

  kuzzle
    .security
    .deleteUser(user.id, (error, result) => {

    })
}

export const searchUsers = (store, filters) => {
  kuzzle
    .security
    .searchUsers(filters, (error, result) => {
      console.log(result)
    })
}
