<template>
  <v-jsoneditor
    v-model="json"
    data-cy="JSONEditor"
    ref="jsoneditor"
    :id="id"
    :options="options"
    :plus="true"
    :height="editorHeight"
    @error="onError"
  />
</template>

<style lang="scss" rel="stylesheet/scss">
.jsoneditor-poweredBy {
  visibility: hidden;
}

.ace_text-input {
  position: relative;
}

.ace-tomorrow.ace_editor.readonly {
  background-color: #d6d6d6;
  .ace_gutter,
  .ace_active-line {
    background-color: #d6d6d6;
  }
  .ace_selection {
    background: #a7c4de;
  }
}
</style>

<script>
export default {
  name: 'JsonEditor',
  props: {
    content: String,
    readonly: Boolean,
    id: String,
    height: { type: Number, default: 400 },
    refreshAce: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      json: {},
      options: {
        mode: 'code'
      }
    }
  },
  computed: {
    editorHeight() {
      if (this.height === undefined) {
        return '400px'
      } else {
        return this.height + 'px'
      }
    }
  },
  methods: {
    onError() {
      console.error('error')
    },
    getRawValue() {
      return JSON.stringify(this.json)
    },
    setContent(value) {
      this.json = JSON.parse(value)
      // editor.getSession().setValue(value)
    }
  },
  watch: {
    json: {
      handler() {
        this.$emit('change', this.getRawValue())
      }
    },
    refreshAce() {
      // setTimeout(() => {
      //   editor.focus()
      // }, 500)
    }
  },
  mounted() {
    this.json = JSON.parse(this.content)
  }
}
</script>
