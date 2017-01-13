<template>
  <pre id="jsoneditor" :class="myclass"></pre>
</template>

<style type="text/css" media="screen">
  .ace_text-input {
    position: relative;
  }
</style>

<script>
  import Vue from 'vue'

  export default {
    name: 'JsonEditor',
    props: [
      'content',
      'myclass',
      'readonly'
    ],
    data () {
      return {
        editor: {}
      }
    },
    events: {
      'json-editor-refresh' () {
        this.editor.renderer.updateFull(true)
      }
    },
    methods: {
      getJson () {
        try {
          return Object.freeze(JSON.parse(this.editor.getValue()))
        } catch (e) {
          return null
        }
      }
    },
    watch: {
      content () {
        if (this.content && this.editor.getSession) {
          this.editor.getSession().setValue(JSON.stringify(this.content, null, 2))
        }
      }
    },
    mounted () {
      Vue.nextTick(() => {
        /* eslint no-undef: 0 */
        this.editor = ace.edit('jsoneditor')
        this.editor.setTheme('ace/theme/tomorrow')
        this.editor.getSession().setMode('ace/mode/json')
        this.editor.setFontSize(13)
        this.editor.getSession().setTabSize(2)
        this.editor.setReadOnly(this.readonly)
        this.editor.$blockScrolling = Infinity
        this.editor.getSession().setValue(JSON.stringify(this.content, null, 2), -1)
        this.editor.getSession().setValue(JSON.stringify(this.content, null, 2))
      })
    }
  }
</script>
