<template>
  <div class="document-create-update">
    <form class="wrapper" @submit.prevent="submit">
      <!-- Json view -->
      <b-row class="json-view">
        <b-col :cols="$store.state.collection.isRealtimeOnly ? '12' : '6'">
          <h3>Custom content</h3>
          <json-editor
            data-cy="UserCustomContent-jsonEditor"
            ref="jsoneditor"
            class="document-json"
            :content="newContent"
            :height="300"
            @change="jsonChanged"
          />
        </b-col>

        <!-- Mapping -->
        <b-col cols="6" v-if="!$store.state.collection.isRealtimeOnly">
          <h3>Mapping</h3>
          <json-editor
            id="mapping"
            class="document-json"
            :content="mapping"
            :readonly="true"
            :height="300"
          />
        </b-col>
      </b-row>
    </form>
  </div>
</template>

<script>
import JsonEditor from '../../../Common/JsonEditor'
import { mergeSchemaMapping } from '../../../../services/collectionHelper'

export default {
  name: 'CustomData',
  components: {
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
    jsonChanged(value) {
      this.$emit('input', value)
    }
  }
}
</script>
