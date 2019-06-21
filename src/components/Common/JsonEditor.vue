<template>
  <div
    :id="id"
    ref="jsoneditor"
    :class="classes"
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
    content: [Object, String, Number, Array],
    myclass: {
      type: String,
      default: ''
    },
    readonly: Boolean,
    id: String,
    height: { type: Number, default: 250 },
    refreshAce: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editor: {},
      refresh: false
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
  watch: {
    content() {
      if (this.content && this.editor.getSession) {
        this.editor.getSession().setValue(JSON.stringify(this.content, null, 2))
      }
    },
    refreshAce() {
      setTimeout(() => {
        this.editor.focus()
      }, 500)
    }
  },
  mounted() {
    Vue.nextTick(() => {
      /* eslint no-undef: 0 */
      if (!this.id || this.id === '') {
        return
      }

      this.editor = ace.edit(this.$refs.jsoneditor)
      this.editor.setTheme('ace/theme/tomorrow')
      // this.editor.getSession().setMode('ace/mode/json')
      this.editor.setFontSize(13)
      this.editor.getSession().setTabSize(2)
      this.editor.getSession().setMode('ace/mode/javascript')
      this.editor.setReadOnly(this.readonly)
      this.editor.$blockScrolling = Infinity

      if (this.content !== null) {
        this.editor.getSession().setValue(JSON.stringify(this.content, null, 2))
      }
      this.editor.on('change', () => {
        let value = this.getJson()
        this.editor.resize()

        if (value) {
          this.$emit('changed', value)
        }
      })
    })
  },
  methods: {
    getJson() {
      try {
        // return Object.freeze(JSON.parse(this.editor.getValue()))
        return JSON.parse(this.editor.getValue())
      } catch (e) {
        console.log(e)
        return null
      }
    },
    isValid() {
      try {
        JSON.parse(this.editor.getValue())
        return true
      } catch (e) {
        return false
      }
    }
  }
}
</script>
