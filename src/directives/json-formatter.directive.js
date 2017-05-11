import JSONFormatter from 'json-formatter-js'

export default {
  id: 'jsonFormatter',
  update (el, binding) {
    if (!el.innerHTML) {
      const html = new JSONFormatter(binding.value.content, binding.value.open ? Infinity : 0).render()

      el.appendChild(html)
    }
  }
}
