<template>
  <pre id="jsoneditor" class="{{class}}"></pre>
</template>

<style type="text/css" media="screen">
  .ace_text-input {
    position: relative;
  }
</style>

<script>
  let editor

  export default {
    props: [
      'content',
      'class',
      'readonly'
    ],
    watch: {
      content: function () {
        if (this.content) {
          editor.setValue(JSON.stringify(this.content, null, 2), -1)
        }
      }
    },
    ready () {
      /* eslint no-undef: 0 */
      editor = ace.edit('jsoneditor')
      editor.session.setMode('ace/mode/json')
      editor.setTheme('ace/theme/tomorrow')
      editor.setReadOnly(this.readonly)
      editor.$blockScrolling = Infinity
    }
  }
</script>