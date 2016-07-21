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
    watch: {
      content: function () {
        if (this.content) {
          this.editor.setValue(JSON.stringify(this.content, null, 2), -1)
        }
      }
    },
    ready () {
      /* eslint no-undef: 0 */
      this.editor = ace.edit('jsoneditor')
      this.editor.session.setMode('ace/mode/json')
      this.editor.setTheme('ace/theme/tomorrow')
      this.editor.setReadOnly(this.readonly)
      this.editor.$blockScrolling = Infinity
    }
  }
</script>
