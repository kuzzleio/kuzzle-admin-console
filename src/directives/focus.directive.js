import Vue from 'vue'

export default {
  id: 'focus',
  bind(el) {
    Vue.nextTick(() => {
      if (el) {
        el.focus()
      }
    }, 0)
  }
}
