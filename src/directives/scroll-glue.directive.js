export default {
  id: 'scroll-glue',
  update (el, binding) {
    let body = document.getElementsByTagName('body')[0]
    setTimeout(() => {
      if (binding.value) {
        body.scrollTop = body.scrollHeight
      }
    }, 0)
  }
}
