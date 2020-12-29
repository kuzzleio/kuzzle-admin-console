<template>
  <div
    data-cy="JSONEditor"
    :ref="editorReference"
    :class="classes"
    :id="id"
    :style="style"
  />
</template>

<style lang="scss" rel="stylesheet/scss">
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
import Vue from 'vue'

export default {
  name: 'JsonEditor',
  props: {
    reference: String,
    content: String,
    myclass: {
      type: String,
      default: ''
    },
    readonly: Boolean,
    id: String,
    height: { type: Number, default: 250 }
  },
  data() {
    return {
      editorReference: '',
      editor: null
    }
  },
  computed: {
    classes() {
      return (this.readonly ? 'readonly ' : '') + this.myclass
    },
    style() {
      if (this.height === undefined) {
        return { 'min-height': '250px' }
      } else {
        return { 'min-height': this.height + 'px!important' }
      }
    }
  },
  methods: {
    getRawValue() {
      return this.editor.getValue()
    },
    getEditor() {
      return this.editor
    },
    setContent(value) {
      this.$log.debug('Setting content', value)
      this.editor.getSession().setValue(value)
    }
  },
  mounted() {
    this.editorReference = this.reference ? this.reference : 'jsoneditor'
    Vue.nextTick(() => {
      /* eslint no-undef: 0 */
      this.editor = ace.edit(this.$refs[this.editorReference], {
        mode: 'ace/mode/json'
      })
      this.editor.setTheme('ace/theme/tomorrow')
      this.editor.setFontSize(15)
      this.editor.getSession().setTabSize(2)
      this.editor.setReadOnly(this.readonly)
      this.editor.$blockScrolling = Infinity
      this.setContent(this.content)

      // WARNING - Beware of update loops!
      // This event is triggered both when the content changes after
      // user interaction and when it is set programmatically.
      this.editor.on('change', () => {
        this.$emit('change', this.getRawValue())
      })
    })
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.removeAllListeners('change')
    }
  }
}
</script>
