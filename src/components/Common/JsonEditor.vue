<template>
  <div
    :name="id"
    data-cy="JSONEditor"
    :ref="id"
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
    content: String,
    id: {
      type: String,
      default: Date.now().toString() + Math.random().toString()
    },
    myclass: {
      type: String,
      default: ''
    },
    readonly: Boolean,
    height: { type: Number, default: 250 }
  },
  data() {
    return {
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
      Vue.nextTick(() => {
        this.editor.getSession().setValue(value)
      })
    }
  },
  mounted() {
    Vue.nextTick(() => {
      /* eslint no-undef: 0 */
      this.editor = ace.edit(this.$refs[this.id], {
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
  watch: {
    content: {
      handler(value) {
        if (this.editor && value !== this.getRawValue()) {
          this.setContent(value)
        }
      }
    }
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.removeAllListeners('change')
    }
  }
}
</script>
