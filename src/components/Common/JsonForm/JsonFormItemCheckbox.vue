<template>
  <div class="row input-field">
    <input :id="name" type="checkbox" name="name" v-model="value" :checked="content" />
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
    watch: {
      content (v) {
        this.value = v
      },
      value (v) {
        this.$emit('update-value', {name: this.name, value: v})
      }
    }
  }
</script>
