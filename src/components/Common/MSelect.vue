<template>
  <select
    ref="mselect"
    v-model="content"
    @blur="triggerBlur"
  >
    <slot />
  </select>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'MSelect',
  props: {
    value: String,
    onBlur: Function,
    options: [Array, Object]
  },
  data() {
    return {
      content: this.value
    }
  },
  watch: {
    options() {
      setTimeout(() => {
        let $el = $(this.$refs.mselect)
        $el.formSelect('destroy')
        $el.formSelect()
      }, 100)
    },
    value() {
      this.content = this.value
      setTimeout(() => {
        let $el = $(this.$refs.mselect)
        $el.formSelect('destroy')
        $el.formSelect()
      }, 100)
    }
  },
  mounted() {
    Vue.nextTick(() => {
      let $el = $(this.$refs.mselect)
      this.content = this.value
      /* eslint no-undef: 0 */
      $el.formSelect()
      $el.on('change', e => {
        if ($el[0].value) {
          this.$emit('input', $el[0].value)
        }
      })
    })
  },
  methods: {
    triggerBlur() {
      if (this.onBlur) {
        this.onBlur()
      }
    }
  }
}
</script>
