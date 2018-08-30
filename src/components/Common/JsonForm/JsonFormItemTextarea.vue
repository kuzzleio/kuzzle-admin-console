<template>
  <div class="row input-field">
    <div class="row">
      <textarea @input="update" :id="name" class="materialize-textarea">{{value}}</textarea>
      <label :for="name">{{name}}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonFormItemTextarea',
  props: {
    content: Object,
    name: String,
    type: String,
    step: Number,
    parent: String
  },
  data() {
    return {
      value: '',
      display: false
    }
  },
  methods: {
    update(e) {
      this.$emit('update-value', { name: this.name, value: e.target.value })
    },
    initValue() {
      if (this.parent) {
        this.value = this.content[this.parent][this.name]
      } else {
        this.value = this.content[this.name]
      }
    }
  },
  mounted() {
    this.initValue()
  },
  watch: {
    content: 'initValue'
  }
}
</script>
