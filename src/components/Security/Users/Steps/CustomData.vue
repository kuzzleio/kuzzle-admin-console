<template>
  <div class="document-create-update">
    <form class="wrapper" @submit.prevent="submit">
      <div class="row">
        <div class="switch right">
          <label>
            Form
            <input
              type="checkbox"
              :checked="!isFormView"
              @change="switchView"
            />
            <span class="lever" />
            JSON
          </label>
        </div>
      </div>

      <div v-if="isFormView" class="row">
        <div class="col s12 card">
          <div class="card-content">
            <json-form
              :schema="schema"
              :document="value"
              @update-value="updateValue"
            />
          </div>
        </div>
      </div>

      <!-- Json view -->
      <div v-if="!isFormView" class="row json-view">
        <div
          class="col s6 card"
          :class="{ s12: $store.state.collection.isRealtimeOnly }"
        >
          <div class="card-content">
            <span class="card-title">Custom content</span>
            <json-editor
              id="document"
              ref="jsoneditor"
              class="document-json"
              :content="newContent"
              :height="300"
              @changed="jsonChanged"
            />
          </div>
        </div>

        <!-- Mapping -->
        <div v-if="!$store.state.collection.isRealtimeOnly" class="col s6 card">
          <div class="card-content">
            <span class="card-title">Mapping</span>
            <json-editor
              id="mapping"
              class="document-json"
              :content="mapping"
              :readonly="true"
              :height="300"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import JsonForm from '../../../Common/JsonForm/JsonForm'
import JsonEditor from '../../../Common/JsonEditor'
import { mergeSchemaMapping } from '../../../../services/collectionHelper'

export default {
  name: 'CustomData',
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
    mapping: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      viewType: 'form',
      newContent: {}
    }
  },
  computed: {
    isFormView() {
      return this.viewType === 'form'
    },
    schema() {
      return mergeSchemaMapping({}, this.mapping)
    }
  },
  watch: {
    value: function(val) {
      if (this.viewType === 'form') {
        this.newContent = { ...val }
      }
    }
  },
  methods: {
    switchView() {
      if (this.viewType === 'json') {
        Object.assign(this.newContent, this.$refs.jsoneditor.getJson())
      }
      this.viewType = this.isFormView ? 'json' : 'form'
      this.newContent = { ...this.value }
    },
    updateValue(payload) {
      this.newContent[payload.name] = payload.value
      this.$emit('input', this.newContent)
    },
    jsonChanged() {
      this.$emit('input', this.$refs.jsoneditor.getJson())
    }
  }
}
</script>
