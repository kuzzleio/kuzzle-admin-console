<template>
  <div>
    <span class="">{{name}}</span>
    <json-editor :id="name" :content="value" ref="jsoneditor" @changed="jsonChanged"></json-editor>
  </div>
</template>

<script>
  import JsonEditor from '../../Common/JsonEditor'

  export default {
    name: 'JsonFormItemJson',
    components: {
      JsonEditor
    },
    props: {
      content: Object,
      name: String,
      type: String
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
      }
    },
    watch: {
      content (v) {
        if (!v) {
          this.value = {}
        } else {
          console.log('#', this.value)
          this.value = v
        }
      }
    }
  }
</script>
