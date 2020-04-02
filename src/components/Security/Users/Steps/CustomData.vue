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
            :content="value"
            :height="300"
            @change="jsonChanged"
          />
        </b-col>

        <!-- Mapping -->
        <!-- <b-col cols="6" v-if="!$store.state.collection.isRealtimeOnly">
          <h3>Mapping</h3>
          <json-editor
            id="mapping"
            class="document-json"
            :content="JSON.stringify(mapping, null, 2)"
            :readonly="true"
            :height="300"
          />
        </b-col> -->
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
      type: String,
      default: ''
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
  methods: {
    jsonChanged(value) {
      this.$emit('input', value)
    }
  }
}
</script>
