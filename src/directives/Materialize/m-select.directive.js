export default {
  id: 'm-select',
  update (value) {
    let $el = $(this.el)
    let $options = $('option[value=' + value + ']', $el)
    $options.attr('selected', 'selected')
  },
  bind () {
    /* eslint no-undef: 0 */
    setTimeout(() => {
      let $el = $(this.el)

      $el.material_select()
      $el.on('change', () => {
        this.set(this.el.value)
      })
    }, 0)
  }
}
