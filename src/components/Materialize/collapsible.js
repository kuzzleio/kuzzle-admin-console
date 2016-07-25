export default {
  id: 'collapsible',
  bind: () => {
    setTimeout(() => {
      /* eslint no-undef: 0 */
      jQuery('.collapsible').collapsible({
        accordion: false
      })
    }, 0)
  }
}
