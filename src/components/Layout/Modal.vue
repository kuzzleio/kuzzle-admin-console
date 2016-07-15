<template>
  <div>
    <div v-if="active" :transition="transition" :id="id" :style="computedStyle" class="modal" :class="computedClasses">
      <slot name="content">
        <div class="modal-content">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </slot>
    </div>

    <div
      v-if="active"
      transition="modal-overlay"
      @click="close"
      class="lean-overlay"
      style="z-index: 1002; display: block; opacity: 0.5;">
    </div>
  </div>
</template>

<script>
  // translated from https://github.com/appcomponents/material-components/tree/master/src/components/modal
  const ESC = 27

  export default {
    props: {
      id: {
        type: String,
        required: false,
        'default': null
      },
      result: {
        type: String,
        required: false,
        'default': null
      },
      'class': {
        type: String,
        required: false,
        'default': '',
        twoWay: false
      },
      bottom: {
        type: Boolean,
        required: false,
        'default': false,
        twoWay: false
      }
    },
    events: {
      'modal::open': function (id) {
        if (this.id === null || typeof this.id === 'undefined') {
          this.open()
        } else if (this.id === id) {
          this.open()
        }
      },
      'modal::close': function (result, id) {
        if ((this.id === null || typeof this.id === 'undefined') || (this.id === id)) {
          this.close()
          this.result = result
          return true
        }
      }
    },
    watch: {
      active: function (active) {
        if (active) {
          window.document.body.style.overflow = 'hidden'
        } else {
          window.document.body.style.overflow = 'visible'
        }
      }
    },
    data () {
      return {
        active: false
      }
    },
    ready () {
      window.document.addEventListener('keydown', evt => {
        evt = evt || window.event

        if (evt.keyCode === ESC) {
          this.close()
        }
      })
    },
    computed: {
      computedStyle () {
        if (this.active) {
          return this.bottom ? {
            'z-index': 1003,
            'display': 'block',
            'opacity': 1,
            'bottom': '0px'
          } : {
            'z-index': 1003,
            'display': 'block',
            'top': '10%'
          }
        }

        return null
      },
      computedClasses () {
        var classes = ''
        if (this.class) {
          classes += this.class
        }
        if (this.bottom) {
          classes += ' '
          classes += 'bottom-sheet'
        }

        return classes
      },
      transition () {
        return this.bottom ? 'modal-bottom' : 'modal'
      }
    },
    methods: {
      open () {
        if (!this.active) {
          this.active = true
        }
      },
      close () {
        if (this.active) {
          this.active = false
          this.result = null
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .modal-overlay-transition {
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;

    -webkit-animation-duration: 0.3s;
    animation-duration: 0.3s;

    -webkit-animation-name: fadeIn-0-5;
    animation-name: fadeIn-0-5;
  }

  .modal-overlay-enter, .modal-overlay-leave {
    opacity: 0;
  }

  .modal-overlay-leave {
    -webkit-animation-duration: 0.2s;
    animation-duration: 0.2s;

    -webkit-animation-name: fadeOut-0-5;
    animation-name: fadeOut-0-5;
  }

  .modal-transition {
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;


    -webkit-animation-duration: 0.3s;
    animation-duration: 0.3s;

    -webkit-animation-name: zoomIn;
    animation-name: zoomIn;
  }

  .modal-leave {
    opacity: 0;
  }

  .modal-leave {
    -webkit-animation-duration: 0.2s;
    animation-duration: 0.2s;

    -webkit-animation-name: fadeOut;
    animation-name: fadeOut;
  }

  .modal-bottom-transition {
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;


    -webkit-animation-duration: 0.3s;
    animation-duration: 0.3s;

    -webkit-animation-name: slideInUp;
    animation-name: slideInUp;
  }

  .modal-bottom-leave {
    opacity: 0;
  }

  .modal-bottom-leave {
    -webkit-animation-duration: 0.2s;
    animation-duration: 0.2s;

    -webkit-animation-name: slideOutDown;
    animation-name: slideOutDown;
  }
</style>