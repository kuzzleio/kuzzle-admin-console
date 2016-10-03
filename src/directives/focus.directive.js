import Vue from 'vue'

export default {
  id: 'focus',
  bind () {
    Vue.nextTick(() => {
      if (this.el) {
        this.el.focus()
      }
    }, 0)
  }
}
