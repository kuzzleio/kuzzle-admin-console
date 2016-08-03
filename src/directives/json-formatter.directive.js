import JSONFormatter from 'json-formatter-js'

export default {
  id: 'jsonFormatter',
  update (newValue) {
    let html = new JSONFormatter(newValue, Infinity).render()

    this.el.appendChild(html)
  }
}
