export default {
  id: 'title',
  update (el, binding) {
    if (binding.value.active === true) {
      el.classList.add('tooltipped')
      el.setAttribute('data-position', binding.value.position || 'right')
      el.setAttribute('data-delay', '50')
      el.setAttribute('data-tooltip', binding.value.title)

      /* eslint no-undef: 0 */
      $(el).tooltip()
      $(el).on('click', () => {
        $(el).tooltip('remove')
      })
    }
  }
}
