<template>
  <div>
    <div v-if="active" :transition="transition" :id="id" class="modal" :class="computedClasses">
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
  const ESC_KEY = 27

  export default {
    props: {
      id: String,
      result: String,
      'class': String,
      bottom: Boolean
    },
    events: {
      'modal-open': function (id) {
        if (this.id === id) {
          this.open()
        }
      },
      'modal-close': function (result, id) {
        if (this.id === id) {
          this.close()
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

        if (evt.keyCode === ESC_KEY) {
          this.close()
        }
      })
    },
    computed: {
      computedClasses () {
        if (!this.active) {
          return null
        }

        if (this.bottom) {
          return 'bottom-modal bottom-sheet'
        }

        return 'normal-modal'
      },
      transition () {
        return this.bottom ? 'modal-bottom' : 'modal'
      }
    },
    methods: {
      open () {
        this.active = true
      },
      close () {
        this.active = false
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .modal {
    &.bottom-modal {
      z-index: 1003;
      display: block;
      opacity: 1;
      bottom: 0;
    }
    &.normal-modal {
      z-index: 1003;
      display: block;
      top: 10%;
    }
  }
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