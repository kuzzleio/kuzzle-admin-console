<template>
  <div class="row input-field">
    <div class="row">
      <textarea
        :id="name"
        v-model="value"
        class="materialize-textarea"
        @input="update"
      />
      <label :for="name">{{ name }}</label>
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
  watch: {
    content: 'initValue'
  },
  mounted() {
    this.initValue()
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
  }
}
</script>

<style>
.materialize-textarea {
  resize: both;
}
</style>
