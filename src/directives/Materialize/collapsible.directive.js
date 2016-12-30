export default {
  id: 'collapsible',
  bind: () => {
    setTimeout(() => {
      $('.collapsible').collapsible({
        accordion: false
      })
    }, 0)
  }
}
