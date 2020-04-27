export default {
  id: 'm-select',
  update(el) {
    let $options = $('option[value=' + el.value + ']', $(el))
    $options.attr('selected', 'selected')
  },
  bind(el) {
    let $el: any = $(el)
    setTimeout(() => {
      $el.material_select()
      // $el.on('change', () => {
      // this.set(el.value)
      // })
    }, 0)
  }
}
