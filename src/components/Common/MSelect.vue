<template>
  <select ref="mselect" v-model="value" @blur="triggerBlur">
    <slot></slot>
  </select>
</template>

<script>
  import Vue from 'vue'

  export default {
    name: 'MSelect',
    props: {
      model: String,
      onBlur: Function
    },
    data () {
      return {
        value: 'string'
      }
    },
    methods: {
      triggerBlur () {
        if (this.onBlur) {
          this.onBlur()
        }
      }
    },
    mounted () {
      Vue.nextTick(() => {
        let $el = $(this.$refs.mselect)
        this.value = this.model
        /* eslint no-undef: 0 */
        $el.material_select()
        $el.on('change', (e) => {
          if ($el[0].value) {
            this.$emit('input', $el[0].value)
          }
        })
      })
    }
  }
</script>
