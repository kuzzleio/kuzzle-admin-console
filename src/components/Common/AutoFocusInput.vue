<template>
  <b-form-input
    :ref="refName"
    v-model="value"
    v-bind="$attrs"
    data-auto-focus-input="true"
  />
</template>

<script>
export default {
  name: 'AutoFocusInput',
  props: {
    name: {
      type: String,
      required: true
    },
    initialValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: this.initialValue,
    }
  },
  computed: {
    refName() {
      return `auto-focus-input-${this.name}`
    }
  },
  methods: {
    // AutoFocusInput should not handle keypress when user is using another input
    shouldHandleKeypress() {
      const tagType = document.activeElement.tagName

      // If we are currently selecting another input
      if (tagType === 'INPUT' && !document.activeElement.dataset.autoFocusInput) {
        return false
      }

      return true
    },
    isFocus() {
      return this.$refs[this.refName].$refs.input === document.activeElement
    },
    listenKeypress() {
      document.onkeypress = keyEvent => {
        if (!this.shouldHandleKeypress()) {
          return
        }

        if (this.isFocus()) {
          if (keyEvent.code === 'Enter') {
            this.$emit('submit')
          }

          return
        }

        this.$refs[this.refName].focus()

        // Firefox does not follow the key event to the input but Chrome does
        // so after the event has finished his propagation, we check the input
        // value and on Firefox it will be empty so we put the first letter inside
        // Using preventDefault() to manually input the first letter and prevent
        // to have double input on Chrome doesn't work well because then the cursor
        // is at the wrong place
        setTimeout(() => {
          if (this.value === '') {
            this.value = keyEvent.key
          }
        }, 1)
      }
    },
    stopListenKeypress() {
      document.onkeypress = null
    }
  },
  mounted() {
    this.listenKeypress()
  },
  watch: {
    value() {
      this.$emit('input', this.value)
    }
  },
  beforeDestroy() {
    this.stopListenKeypress()
  }
}
</script>
