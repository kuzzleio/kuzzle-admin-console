import Vue from 'vue'

export default {
  id: 'focus',
  bind () {
    Vue.nextTick(() => {
      this.el.focus()
    }, 0)
  }
}
