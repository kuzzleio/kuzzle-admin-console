<template>
  <form @submit.prevent="create">
    <!-- Json view -->
    <div class="row json-view">
      <div class="col s6 card">
        <div class="card-content">
          <span class="card-title">Credentials</span>
          <json-editor
            class="document-json"
            ref="jsoneditor"
            :id="idContent"
            :content="jsonDocument"
            :height="300"
            @changed="jsonChanged"
          ></json-editor>
        </div>
      </div>

      <!-- Fields -->
      <div class="col s6 card">
        <div class="card-content">
          <span class="card-title">Fields</span>
          <json-editor
            class="document-json"
            :id="idMapping"
            :content="mapping"
            :readonly="true"
            :height="300"
          ></json-editor>
        </div>
      </div>
    </div>
  </form>
</template>

<style rel="stylesheet/scss" lang="scss">
.input-id {
  margin-bottom: 0;
}
.error {
  position: relative;
  padding: 8px 12px;
  margin: 0;
}
.dismiss-error {
  position: absolute;
  right: 10px;
  cursor: pointer;
  padding: 3px;
  border-radius: 2px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>

<script>
import JsonForm from '../../Common/JsonForm/JsonForm'
import JsonEditor from '../../Common/JsonEditor'

export default {
  name: 'DocumentCreateOrUpdate',
  components: {
    JsonForm,
    JsonEditor
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    mapping: [Object, Array],
    idContent: {
      type: String,
      default: 'content'
    },
    idMapping: {
      type: String,
      default: 'mapping'
    }
  },
  data() {
    return {
      jsonDocument: {}
    }
  },
  methods: {
    jsonChanged(json) {
      this.$emit('input', json)
    }
  },
  mounted() {
    this.jsonDocument = this.value || {}
  }
}
</script>
