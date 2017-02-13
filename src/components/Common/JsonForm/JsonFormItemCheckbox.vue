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
      type: String,
      parent: String
    },
    data () {
      return {
        value: false
      }
    },
    methods: {
      initValue () {
        if (this.parent) {
          this.value = this.content[this.parent][this.name]
        } else {
          this.value = this.content[this.name]
        }
      }
    },
    mounted () {
      this.initValue()
    },
    watch: {
      content: 'initValue'
    }
  }
</script>
