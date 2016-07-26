<template>
  <pre id="jsoneditor" class="{{class}}"></pre>
</template>

<style type="text/css" media="screen">
  .ace_text-input {
    position: relative;
  }
</style>

<script>
  export default {
    props: [
      'content',
      'class',
      'readonly'
    ],
    data () {
      return {
        editor: {}
      }
    },
    events: {
      'json-editor-request-json' () {
        try {
          let parsedContent = Object.freeze(JSON.parse(this.editor.getValue()))
          this.$dispatch('json-editor-receive-json', parsedContent)
        } catch (e) {
          this.$dispatch('json-editor-receive-json', null)
        }
      },
      'json-editor-refresh' () {
        this.editor.renderer.updateFull(true)
        this.editor.resize()
      }
    },
    watch: {
      content: function () {
        if (this.content) {
          this.editor.getSession().setValue(JSON.stringify(this.content, null, 2), -1)
          this.editor.renderer.updateFull(true)
          this.editor.resize()
        }
      }
    },
    ready () {
      /* eslint no-undef: 0 */
      this.editor = ace.edit('jsoneditor')
      this.editor.setTheme('ace/theme/tomorrow')
      this.editor.getSession().setMode('ace/mode/json')
      this.editor.setFontSize(13)
      this.editor.getSession().setTabSize(2)
      this.editor.setReadOnly(this.readonly)
      this.editor.$blockScrolling = Infinity

      this.editor.getSession().setValue(JSON.stringify(this.content, null, 2), -1)
    }
  }
</script>
