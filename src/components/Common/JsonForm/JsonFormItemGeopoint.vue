<template>
  <div>
    <span class="">{{name}}</span>
    <json-editor :id="name" :content="value" ref="jsoneditor" @changed="jsonChanged"></json-editor>
  </div>
</template>

<script>
  import JsonEditor from '../../Common/JsonEditor'

  export default {
    name: 'JsonFormItemGeopoint',
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
        value: false
      }
    },
    mounted () {
      if (!this.content) {
        this.value = {
          'lat': 0,
          'lon': 0
        }
      } else {
        this.value = this.content
      }
    },
    methods: {
      getJsonValue () {
        return this.$refs.jsoneditor.getJson()
      },
      jsonChanged (v) {
        this.$emit('update-value', {name: this.name, value: v})
      }
    }
  }
</script>
