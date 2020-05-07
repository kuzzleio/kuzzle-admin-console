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
      value: '',
      isFocus: false
    }
  },
  methods: {
    looseFocus() {
      console.log('loose foc')
      this.isFocus = false
    },
    listenKeypress () {
      console.log('listen')
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
      }
    },
    stopListenKeypress () {
      console.log('stop')
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
