import JSONFormatter from 'json-formatter-js'

export default {
  id: 'jsonFormatter',
  update(el, binding) {
    const html = new JSONFormatter(
      binding.value.content,
      binding.value.open ? Infinity : 0
    ).render()

    el.innerHTML = ''
    el.appendChild(html)
  },
  bind(el, binding) {
    const html = new JSONFormatter(
      binding.value.content,
      binding.value.open ? Infinity : 0
    ).render()

    el.appendChild(html)
  }
}
