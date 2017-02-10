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
      type: String,
      parent: String
    },
    data () {
      return {
        value: {
          'lat': 0,
          'lon': 0
        }
      }
    },
    methods: {
      jsonChanged (v) {
        this.$emit('update-value', {name: this.name, value: v})
      }
    },
    watch: {
      content () {
        if (this.parent) {
          this.value = this.content[this.parent][this.name]
        } else {
          this.value = this.content[this.name]
        }
      }
    }
  }
</script>
