import JSONFormatter from 'json-formatter-js'

export default {
  id: 'jsonFormatter',
  update (el, binding) {
    if (!el.innerHTML) {
      let html = new JSONFormatter(binding.value, Infinity).render()

      el.appendChild(html)
    }
  }
}
