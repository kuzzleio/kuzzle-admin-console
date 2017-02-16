<template>
  <div class="row input-field">
    <div class="col s7">
      <span class="">{{name}}</span>
      <json-editor :id="name + 'json'" class="field-json" :content="value" ref="jsoneditor" @changed="jsonChanged"></json-editor>
    </div>
    <div class="col s5">
      <span class="">{{name}} mapping</span>
      <json-editor :id="name + 'mapping'" class="field-json" :content="attributeMapping" :readonly="true" ref="jsoneditor"></json-editor>
    </div>
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
      parent: String,
      mapping: Object
    },
    data () {
      return {
        value: null
      }
    },
    computed: {
      attributeMapping () {
        let _mapping = {}

        if (this.parent) {
          _mapping = this.$store.getters.simplifiedMapping[this.parent][this.name] || {}
        } else {
          _mapping = this.$store.getters.simplifiedMapping[this.name] || {}
        }

        return _mapping
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
            this.value = null
            return
          }

          if (this.parent) {
            if (this.content[this.parent] && this.content[this.parent][this.name]) {
              this.value = this.content[this.parent][this.name] || null
            }
          } else {
            this.value = this.content[this.name] || null
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
