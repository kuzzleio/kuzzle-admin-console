<template>
  <form class="UserCustomMappingEditor wrapper" @submit.prevent="submit">
    <div class="row">
      <div class="col s8">
        <div class="row">
          <p>Mapping:</p>
          <json-editor
            id="user-custom-data-mapping-editor"
            ref="jsoneditor"
            tabindex="4"
            myclass="pre_ace"
            :content="mapping"
          />
        </div>
      </div>

      <div class="col s4">
        <div class="row">
          <div class="help">
            Mapping is the process of defining how a document, and the fields it
            contains, are stored and indexed.
            <a
              href="https://docs.kuzzle.io/api/1/controller-collection/update-mapping/"
              target="_blank"
              >Read more about mapping</a
            >
            <br />
            You should omit the root "properties" field in this form.
            <pre>
              {
                "age": { "type": "integer" },
                "name": { "type": "string" }
              }
            </pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s12">
        <a
          tabindex="6"
          class="btn-flat waves-effect"
          @click.prevent="$emit('cancel')"
          >Cancel</a
        >
        <button
          type="submit"
          class="UserCustomMappingEditor-submit btn primary waves-effect waves-light"
        >
          Save
        </button>
      </div>
    </div>
  </form>
</template>

<script type="text/javascript">
import JsonEditor from '../../../Common/JsonEditor' ;

export default {
  name: 'UserCustomMappingEditor',
  components: {
    JsonEditor
  },
  props: {
    mapping: {
      type: Object,
      default: () => {
        return {} ;
      }
    },
    currentStep: {
      type: Number
    }
  },
  watch: {
    currentStep() {
      let newMapping = this.$refs.jsoneditor.getJson()
      this.$emit('submit', newMapping)
    }
  },
  methods: {
    submit() {
      let newMapping = this.$refs.jsoneditor.getJson()
      this.$emit('submit', newMapping)
    }
  }
} ;
</script>
