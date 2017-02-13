<template>
  <div>
    <span class="">{{name}}</span>
    <json-editor :id="name" class="field-json" :content="value" ref="jsoneditor" @changed="jsonChanged"></json-editor>
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
      },
      initValue () {
        if (this.parent) {
          this.value = this.content[this.parent][this.name]
        } else {
          this.value = this.content[this.name]
        }
      }
    },
    mounted () {
      this.initValue()
    },
    watch: {
      content: 'initValue'
    }
  }
</script>
