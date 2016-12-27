<template>
  <select ref="mselect" v-model="value">
    <slot></slot>
  </select>
</template>

<script>
  import Vue from 'vue'

  export default {
    name: 'MSelect',
    props: {
      model: String
    },
    data () {
      return {
        value: 'string'
      }
    },
    mounted () {
      Vue.nextTick(() => {
        let $el = $(this.$refs.mselect)
        this.value = this.model
        /* eslint no-undef: 0 */
        $el.material_select()
        $el.on('change', (e) => {
          this.$emit('input', $el[0].value)
        })
      })
    }
  }
</script>
