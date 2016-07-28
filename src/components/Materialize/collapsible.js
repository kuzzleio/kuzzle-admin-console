export default {
  id: 'collapsible',
  bind: () => {
    setTimeout(() => {
      // eslint-disable-next-line no-undef
      jQuery('.collapsible').collapsible({
        accordion: false
      })
    }, 0)
  }
}
