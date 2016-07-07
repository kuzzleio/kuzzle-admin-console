module.exports = {
  init: function (context) {
    if (!context.store) {
      throw new Error('Undefined store in context')
    }

    context.store.dispatch(
      context.mutations.ADD_ITEM,
      'dummy'
    )
  }
}
