<template>
  <form class="UserCustomMappingEditor wrapper" @submit.prevent="submit">
    <div class="row">
      <div class="col s8">
        <div class="row">
          <p>Mapping:</p>
          <json-editor
            id="user-custom-data-mapping-editor"
            tabindex="4"
            ref="jsoneditor"
            myclass="pre_ace"
            :content="mapping">
          </json-editor>
        </div>
      </div>

      <div class="col s4">
        <div class="row">
          <p class="help">
            Mapping is the process of defining how a document,
            and the fields it contains, are stored and indexed.
            <a href="https://docs.kuzzle.io/api/1/controller-collection/update-mapping/" target="_blank">Read more about mapping</a>
          </br>
            <pre>
{
  "properties": {
    "age": { "type": "integer" },
    "name": { "type": "text" }
  }
}
            </pre>
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s12">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="$emit('cancel')">Cancel</a>
        <button type="submit" class="UserCustomMappingEditor-submit btn primary waves-effect waves-light">Save</button>
      </div>
    </div>
  </form>
</template>

<script type="text/javascript">
import JsonEditor from '../../../Common/JsonEditor'

export default {
  name: 'UserCustomMappingEditor',
  components: {
    JsonEditor
  },
  props: {
    mapping: {
      type: Object,
      default: () => {
        return {}
      }
    },
    currentStep: {
      type: Number
    }
  },
  methods: {
    submit() {
      let newMapping = this.$refs.jsoneditor.getJson()
      this.$emit('submit', newMapping)
    }
  },
  watch: {
    currentStep(value) {
      let newMapping = this.$refs.jsoneditor.getJson()
      this.$emit('submit', newMapping)
    }
  }
}
</script>
