export default {
  id: 'scroll-fix',
  update (el, binding) {
    if (window.scrollY < 240 && binding.value) {
      el.classList.add('closed')
    } else {
      el.classList.remove('closed')
    }
  }
}
