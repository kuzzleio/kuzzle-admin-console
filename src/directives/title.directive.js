export default {
  id: 'title',
  update (value) {
    if (value.active === true) {
      this.el.classList.add('tooltipped')
      this.el.setAttribute('data-position', value.position || 'right')
      this.el.setAttribute('data-delay', '50')
      this.el.setAttribute('data-tooltip', value.title)

      /* eslint no-undef: 0 */
      $(this.el).tooltip()
      $(this.el).on('click', () => {
        $(this.el).tooltip('remove')
      })
    }
  }
}
