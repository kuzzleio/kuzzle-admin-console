<template>
  <div class="document-create-update">
    <form class="wrapper" @submit.prevent="submit">
      <b-row no-gutters class="mb-2">
        <span class="mr-2">Form</span>
        <b-form-checkbox switch :checked="!isFormView" @change="switchView">
          JSON
        </b-form-checkbox>
      </b-row>

      <b-row v-if="isFormView">
        <b-col cols="12">
          <b-card>
            <json-form
              :schema="schema"
              :document="value"
              @update-value="updateValue"
            />
          </b-card>
        </b-col>
      </b-row>

      <!-- Json view -->
      <b-row v-else class="json-view">
        <b-col :cols="$store.state.collection.isRealtimeOnly ? '12' : '6'">
          <b-card>
            <b-card-title>Custom content</b-card-title>
            <json-editor
              id="document"
              ref="jsoneditor"
              class="document-json"
              :content="JSON.stringify(newContent)"
              :height="300"
              @changed="jsonChanged"
            />
          </b-card>
        </b-col>

        <!-- Mapping -->
        <b-col cols="6" v-if="!$store.state.collection.isRealtimeOnly">
          <b-card>
            <b-card-title>Mapping</b-card-title>
            <json-editor
              id="mapping"
              class="document-json"
              :content="JSON.stringify(mapping)"
              :readonly="true"
              :height="300"
            />
          </b-card>
        </b-col>
      </b-row>
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
