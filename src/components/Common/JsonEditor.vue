<template>
  <b-form-textarea
    ref="myjsoneditor"
    size="lg"
    rows="16"
    :id="id"
    :class="myclass"
    :disabled="readonly"
    v-model="jsonContent"
    @keydown.tab.exact.prevent
    @keyup.tab.exact="addTab"
  />
</template>

<script>
export default {
  name: 'JsonEditor',
  props: {
    content: String,
    myclass: {
      type: String,
      default: ''
    },
    readonly: Boolean,
    id: String
  },
  data() {
    return {
      jsonContent: ''
    }
  },
  methods: {
    addTab() {
      const index = this.$refs.myjsoneditor.selectionStart
      this.jsonContent =
        this.jsonContent.substr(0, index) +
        '  ' +
        this.jsonContent.substr(index, this.jsonContent.length)
      setTimeout(() => {
        this.$refs.myjsoneditor.selectionEnd = this.$refs.myjsoneditor.selectionStart =
          index + 2
      }, 10)
    }
  },
  watch: {
    jsonContent() {
      this.$emit('change', this.jsonContent)
    }
  },
  mounted() {
    this.jsonContent = JSON.stringify(JSON.parse(this.content), null, 2)
  }
}
</script>

<style lang="scss" rel="stylesheet/scss"></style>
