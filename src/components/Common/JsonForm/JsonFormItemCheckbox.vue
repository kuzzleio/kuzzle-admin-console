<template>
  <label>
    <input :id="name" type="checkbox" name="name" @change="update" :checked="value" />
    <span>{{name}}</span>
  </label>
</template>

<script>
export default {
  name: 'JsonFormItemCheckbox',
  props: {
    content: Object,
    name: String,
    type: String,
    parent: String
  },
  data() {
    return {
      value: false
    }
  },
  methods: {
    initValue() {
      if (!this.content) {
        return
      }

      if (this.parent) {
        this.value = this.content[this.parent][this.name] || false
      } else {
        this.value = this.content[this.name] || false
      }
    },
    update(e) {
      this.$emit('update-value', { name: this.name, value: e.target.checked })
    }
  },
  mounted() {
    this.initValue()
    this.$emit('update-value', { name: this.name, value: this.value })
  },
  watch: {
    content: 'initValue'
  }
}
</script>
