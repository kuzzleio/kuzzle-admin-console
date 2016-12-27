<template>
  <div ref="scroll">
    <slot></slot>
  </div>
</template>

<script>
  import Vue from 'vue'

  export default {
    data () {
      return {
        scrolled: false,
        height: 0,
        scrollListener: null
      }
    },
    props: {
      nbElement: {
        type: Number,
        default: 0
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      checkDisplay (ref) {
        if (this.scrolled) {
          this.scrolled = false

          if (window.scrollY > this.height && ref.classList.contains('closed')) {
            ref.classList.remove('closed')
          } else if (window.scrollY <= this.height && !ref.classList.contains('closed')) {
            ref.classList.add('closed')
          }
        }
      }
    },
    mounted () {
      Vue.nextTick(() => {
        console.log(this.$refs)

        this.scrolled = false

        window.onscroll = () => {
          this.scrolled = true
        }

        this.scrollListener = setInterval(this.checkDisplay(this.$refs.scroll), 100)
      })
    },
    destroyed () {
      if (this.scrollListener) {
        clearInterval(this.scrollListener)
        this.scrollListener = null
      }
    },
    watch: {
      nbElement () {
        let body = document.getElementsByTagName('body')[0]

        if (this.$refs.scroll.offsetHeight) {
          this.height = this.$refs.scroll.offsetHeight
        }

        if (this.active !== false) {
          setTimeout(() => {
            body.scrollTop = body.scrollHeight
          }, 0)
        }
      }
    }
  }
</script>
