export default {
  id: 'scroll-glue',
  update (value) {
    let el = this.el

    if (this.arg.indexOf('element-tag') >= 0) {
      let tag = Object.keys(this.modifiers)[0]
      el = document.getElementsByTagName(tag)[0]
    }

    if (value.active !== false) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 0)
    }
  }
}
