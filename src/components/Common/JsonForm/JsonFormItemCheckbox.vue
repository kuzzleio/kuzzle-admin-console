<template>
  <label class="JsonFormItemCheckbox">
    <input
      :id="name"
      type="checkbox"
      name="name"
      :checked="value"
      @change="update"
    />
    <span>{{ name }}</span>
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
  watch: {
    content: 'initValue'
  },
  mounted() {
    this.initValue()
    this.$emit('update-value', { name: this.name, value: this.value })
  },
  methods: {
    initValue() {
      if (!this.content) {
        return
      }

      if (this.parent && this.content[this.parent]) {
        this.value = this.content[this.parent][this.name] || false
      } else {
        this.value = this.content[this.name] || false
      }
    },
    update(e) {
      this.$emit('update-value', { name: this.name, value: e.target.checked })
    }
  }
}
</script>

<style scoped>
.JsonFormItemCheckbox {
  position: relative !important;
}
</style>
