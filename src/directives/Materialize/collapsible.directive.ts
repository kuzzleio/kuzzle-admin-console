export default {
  id: 'collapsible',
  bind: () => {
    setTimeout(() => {
      const collapsible: any = $('.collapsible')
      collapsible.collapsible({
        accordion: false
      })
    }, 0)
  }
}
