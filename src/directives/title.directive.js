export default {
  id: 'title',
  update (value) {
    if (value.active && value.title.trim()) {
      this.el.title = value.title
    }
  }
}
