export default {
  id: 'scroll-glue',
  height: 0,
  scrolled: false,
  checkDisplay () {
    if (this.scrolled) {
      this.scrolled = false

      if (window.scrollY > this.height && this.el.classList.contains('closed')) {
        this.el.classList.remove('closed')
      } else if (window.scrollY <= this.height && !this.el.classList.contains('closed')) {
        this.el.classList.add('closed')
      }
    }
  },
  bind () {
    this.scrolled = false

    // display the element when user scroll (or when scroll glue is active)
    window.onscroll = () => {
      this.scrolled = true
    }

    // delay position checking in an interval instead of onscroll event to reduce lags
    this.scrollListener = setInterval(this.checkDisplay.bind(this), 100)
  },
  unbind () {
    if (this.scrollListener) {
      clearInterval(this.scrollListener)
      this.scrollListener = null
    }
  },
  update (value) {
    let body = document.getElementsByTagName('body')[0]

    if (value.height) {
      this.height = value.height
    }
    if (value.active !== false) {
      setTimeout(() => {
        body.scrollTop = body.scrollHeight
      }, 0)
    }
  }
}
