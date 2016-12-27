export default {
  id: 'scroll-glue',
  // height: 0,
  // scrolled: false,
  // checkDisplay (el) {
  //   if (this.scrolled) {
  //     this.scrolled = false
  //
  //     if (window.scrollY > this.height && el.classList.contains('closed')) {
  //       el.classList.remove('closed')
  //     } else if (window.scrollY <= this.height && !el.classList.contains('closed')) {
  //       el.classList.add('closed')
  //     }
  //   }
  // },
  // bind (el) {
  //   this.scrolled = false
  //
  //   // display the element when user scroll (or when scroll glue is active)
  //   window.onscroll = () => {
  //     this.scrolled = true
  //   }
  //
  //   // delay position checking in an interval instead of onscroll event to reduce lags
  //   this.scrollListener = setInterval(this.checkDisplay(el), 100)
  // },
  // unbind () {
  //   if (this.scrollListener) {
  //     clearInterval(this.scrollListener)
  //     this.scrollListener = null
  //   }
  // },
  update () {
    let body = document.getElementsByTagName('body')[0]
    //
    // if (binding.value.height) {
    //   this.height = binding.value.height
    // }
    // if (binding.value.active !== false) {
    setTimeout(() => {
      body.scrollTop = body.scrollHeight
    }, 0)
  }
}
