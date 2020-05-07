<template>
  <b-form-input
    :ref="refName"
    v-model="value"
    v-bind="$attrs"
    @blur="looseFocus"
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
    },
  },
  computed: {
    refName() {
      return `auto-focus-input-${this.name}`
    }
  },
  watch: {
    value () {
      this.$emit('input', this.value)
    }
  },
  data () {
    return {
      value: this.initialValue,
      isFocus: false
    }
  },
  methods: {
    looseFocus() {
      this.isFocus = false
    },
    listenKeypress () {
      document.onkeypress = keyEvent => {
        if (this.isFocus) {
          if (keyEvent.code === 'Enter') {
            this.$emit('submit')
          }

          return;
        }

        this.isFocus = true;
        this.value = ''
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
    stopListenKeypress () {
      document.onkeypress = null
    }
  },
  mounted () {
    this.listenKeypress()
  },
  beforeDestroy() {
    this.stopListenKeypress()
  }

}
</script>
