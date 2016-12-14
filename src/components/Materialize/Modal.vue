<template>
  <div>
    <div v-if="active" :transition="transition" :id="id" class="modal" :class="computedClasses">
      <slot name="content">
        <div class="modal-content">
          <slot></slot>
        </div>
        <div class="modal-footer" v-if="hasFooter">
          <slot name="footer"></slot>
        </div>
      </slot>
    </div>

    <div
      v-if="active"
      transition="modal-overlay"
      @click="canClose && close()"
      class="lean-overlay"
      style="z-index: 1002; display: block; opacity: 0.5;">
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  // translated from https://github.com/appcomponents/material-components/tree/master/src/components/modal
  const ESC_KEY = 27

  export default {
    props: {
      id: String,
      'class': {
        type: String,
        'default': '',
        required: false
      },
      canClose: {
        type: Boolean,
        'default': true,
        required: false
      },
      hasFooter: {
        type: Boolean,
        'default': true,
        required: false
      },
      bottom: Boolean,
      isOpen: Boolean
    },
    events: {
      'modal-open': function (id) {
        if (this.id === id) {
          this.open()
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
      },
      isOpen (open) {
        if (open) {
          this.open()
        } else {
          this.close()
        }
      }
    },
    data () {
      return {
        active: false
      }
    },
    mounted () {
      Vue.nextTick(() => {
        window.document.addEventListener('keydown', this.handleEsc)
      })
    },
    destroyed () {
      window.document.removeEventListener('keydown', this.handleEsc)
    },
    computed: {
      computedClasses () {
        if (!this.active) {
          return null
        }

        if (this.bottom) {
          return 'bottom-modal bottom-sheet ' + this.class
        }

        return 'normal-modal ' + this.class
      },
      transition () {
        return this.bottom ? 'modal-bottom' : 'modal'
      }
    },
    methods: {
      handleEsc (evt) {
        evt = evt || window.event

        if (this.canClose && evt.keyCode === ESC_KEY) {
          this.close()
        }
      },
      open () {
        this.active = true
      },
      close () {
        this.active = false
      },
      closeModal (id) {
        console.log('##', this.id, id)
        if (this.id === id) {
          this.close()
          return true
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .modal {
    overflow-y: visible;
    &.small-modal {
      width: 25%;
    }
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

    .modal-footer {
      padding: 8px 26px;
      height: 66px;

      button {
        &.btn, &.btn-large, &.btn-flat {
          font-size: 1rem;
          margin: 7px 5px;
        }
      }
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