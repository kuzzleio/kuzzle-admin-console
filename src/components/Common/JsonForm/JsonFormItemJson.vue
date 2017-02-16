<template>
  <div class="row input-field">
    <span class="">{{name}}</span>
    <json-editor :id="name" class="field-json" :content="value" ref="jsoneditor" @changed="jsonChanged"></json-editor>
  </div>
</template>

<script>
  import JsonEditor from '../../Common/JsonEditor'

  // We have to init the JSON only if the data comes from the server.
  // This flag allow to not trigger an infinite loop when the doc is updated
  let jsonAlreadyInit = false

  export default {
    name: 'JsonFormItemJson',
    components: {
      JsonEditor
    },
    props: {
      content: Object,
      name: String,
      type: String,
      parent: String
    },
    data () {
      return {
        value: {}
      }
    },
    methods: {
      getJsonValue () {
        return this.$refs.jsoneditor.getJson()
      },
      jsonChanged (v) {
        this.$emit('update-value', {name: this.name, value: v})
        jsonAlreadyInit = true
      },
      initValue () {
        if (!jsonAlreadyInit) {
          if (!Object.keys(this.content).length) {
            this.value = {}
            return
          }

          if (this.parent) {
            this.value = this.content[this.parent][this.name] || {}
          } else {
            this.value = this.content[this.name] || {}
          }

          jsonAlreadyInit = true
        }
      }
    },
    mounted () {
      jsonAlreadyInit = false
      this.initValue()
    },
    watch: {
      content: 'initValue'
    }
  }
</script>
