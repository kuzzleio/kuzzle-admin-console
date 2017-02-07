<template>
  <div class="row input-field">
    <input :type="type" :value="value" @input="update" :step="step" @focus="display = true"/>
    <label :class="{'active': value}">{{name}}</label>
  </div>
</template>

<script>
  export default {
    name: 'JsonFormItemInput',
    props: {
      content: [String, Number],
      name: String,
      type: String,
      step: Number
    },
    data () {
      return {
        value: '',
        display: false
      }
    },
    mounted () {
      this.value = this.content
    },
    methods: {
      update (e) {
        this.$emit('update-value', {name: this.name, value: e.target.value})
      }
    }
  }
</script>
