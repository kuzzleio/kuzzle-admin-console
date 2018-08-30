<template>
  <div>
    <div v-if="isOpen" :id="id" class="modal" :class="computedClasses">
      <slot name="content">
        <div class="modal-content">
          <slot></slot>
        </div>
        <div class="modal-footer" :class="{grey: loading}" v-if="hasFooter">
          <slot name="footer"></slot>
        </div>
      </slot>
    </div>

    <div
      v-if="isOpen"
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
    additionalClass: {
      type: String,
      default: '',
      required: false
    },
    canClose: {
      type: Boolean,
      default: true,
      required: false
    },
    hasFooter: {
      type: Boolean,
      default: true,
      required: false
    },
    footerFixed: {
      type: Boolean,
      default: false
    },
    close: {
      type: Function
    },
    bottom: Boolean,
    isOpen: Boolean,
    loading: Boolean
  },
  watch: {
    isOpen: function(active) {
      if (active) {
        window.document.body.style.overflow = 'hidden'
      } else {
        window.document.body.style.overflow = 'visible'
      }
    }
  },
  mounted() {
    Vue.nextTick(() => {
      window.document.addEventListener('keydown', this.handleEsc)
    })
  },
  destroyed() {
    window.document.removeEventListener('keydown', this.handleEsc)
  },
  computed: {
    computedClasses() {
      let cssClass = ''

      if (!this.isOpen) {
        return null
      }

      if (this.footerFixed) {
        cssClass = 'modal-fixed-footer '
      }

      if (this.bottom) {
        return (
          cssClass +
          'bottom-modal bottom-sheet ' +
          this.additionalClass +
          (this.loading ? ' grey' : '')
        )
      }

      return (
        cssClass +
        'normal-modal ' +
        this.additionalClass +
        (this.loading ? ' grey' : '')
      )
    },
    transition() {
      return this.bottom ? 'modal-bottom' : 'modal'
    }
  },
  methods: {
    handleEsc(evt) {
      evt = evt || window.event

      if (this.canClose && evt.keyCode === ESC_KEY) {
        this.close()
      }
    },
    closeModal(id) {
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
      &.btn,
      &.btn-large,
      &.btn-flat {
        font-size: 1rem;
        margin: 7px 5px;
      }
    }
  }
}

.grey {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
