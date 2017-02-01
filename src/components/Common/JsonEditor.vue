<template>
  <pre :id="id" :class="classes"></pre>
</template>

<style lang="scss" rel="stylesheet/scss">
  .ace_text-input {
    position: relative;
  }
  .ace-tomorrow.ace_editor.readonly {
    background-color: #d6d6d6;
    .ace_gutter, .ace_active-line {
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
    props: [
      'content',
      'myclass',
      'readonly',
      'id'
    ],
    computed: {
      classes () {
        return ((this.readonly ? 'readonly' : '') + this.myclass)
      }
    },
    data () {
      return {
        editor: {}
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
        if (!this.id) {
          return
        }

        this.editor = ace.edit(this.id)
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
