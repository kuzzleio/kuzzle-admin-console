<template>
  <div class="document-create-update">
    <form class="wrapper" @submit.prevent="submit">
      Here, you can define the custom content of your users. The fields you
      define here will appear in the <code>content</code> field of your user
      object, along with <code>profileIds</code> and <code>_kuzzle_info</code>.
      <!-- Json view -->
      <b-row class="mt-3">
        <b-col cols="8">
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
        <b-col>
          <h3>Mapping</h3>
          <pre
            v-json-formatter="{
              content: mapping,
              open: true
            }"
          />
          <!--<json-editor
            id="mapping"
            class="document-json"
            :content="JSON.stringify(mapping, null, 2)"
            :readonly="true"
            :height="300"
          /> -->
        </b-col>
      </b-row>
    </form>
  </div>
</template>

<script>
import JsonEditor from '../../../Common/JsonEditor'
import JsonFormatter from '../../../../directives/json-formatter.directive'

import { mergeSchemaMapping } from '../../../../services/collectionHelper'

export default {
  name: 'CustomData',
  components: {
    JsonEditor
  },
  directives: { JsonFormatter },
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
