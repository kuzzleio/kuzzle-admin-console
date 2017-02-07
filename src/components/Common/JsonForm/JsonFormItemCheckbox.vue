<template>
  <div class="row input-field">
    <input :id="name" type="checkbox" name="name" v-model="value" />
    <label :for="name">{{name}}</label>
  </div>
</template>

<script>
  export default {
    name: 'JsonFormItemCheckbox',
    props: {
      content: {type: Boolean, default: false},
      name: String,
      type: String
    },
    data () {
      return {
        value: false
      }
    },
    mounted () {
      this.value = this.content
    },
    watch: {
      value (v) {
        this.$emit('update-value', {name: this.name, value: v})
        console.log(v)
      }
    }
  }
</script>
