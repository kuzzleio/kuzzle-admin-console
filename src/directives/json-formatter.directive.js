import JSONFormatter from 'json-formatter-js'

export default {
  id: 'jsonFormatter',
  update (el, binding) {
    const html = new JSONFormatter(binding.value.content, binding.value.open ? Infinity : 0).render()
    if (!el.innerHTML) {
      el.appendChild(html)
    } else {
      el.innerHTML = html.innerHTML
    }
  }
}
