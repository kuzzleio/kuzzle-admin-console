<template>
  <div class="DocumentCreateOrUpdate">
    <b-card class="h-100">
      <!-- Json view -->
      <b-row class="h-100">
        <b-col lg="7" md="12" class="DocumentCreateOrUpdate-editorLayout">
          <b-form-group
            label="Document ID"
            label-cols="3"
            :description="
              !id ? 'Leave blank to let Kuzzle auto-generate the ID' : ''
            "
          >
            <b-input :disabled="!!id" v-model="idValue"></b-input>
          </b-form-group>
          <json-editor
            id="document"
            ref="jsoneditor"
            class="DocumentCreateOrUpdate-jsonEditor"
            :content="rawDocument"
            @change="onDocumentChange"
          />
        </b-col>

        <!-- Mapping -->
        <b-col lg="5" md="12" class="DocumentCreateOrUpdate-mappingLayout">
          <h3>Mapping</h3>

          <pre
            v-json-formatter="{
              content: mapping,
              open: true
            }"
            class="DocumentCreateOrUpdate-mapping"
          />
        </b-col>
      </b-row>

      <template v-slot:footer>
        <div class="text-right">
          <b-button @click="$emit('cancel')">Cancel</b-button>
          <b-button v-if="!id" variant="primary" class="ml-2" @click="submit">
            <i class="fa fa-plus-circle left" />
            Create
          </b-button>
          <b-button
            v-if="!!id"
            variant="primary"
            class="ml-2"
            data-cy="DocumentUpdate-btn"
            :disabled="submitting || !isDocumentValid"
            @click="submit"
          >
            <i class="fa fa-pencil-alt left" />
            Update
          </b-button>
          <b-button
            v-if="!!id"
            variant="warning"
            class="ml-2"
            data-cy="DocumentReplace-btn"
            :disabled="submitting || !isDocumentValid"
            @click="submit(true)"
          >
            <i class="fa fa-fire-alt left" />
            Replace
          </b-button>
        </div>
      </template>
    </b-card>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.DocumentCreateOrUpdate {
  flex-grow: 1;

  &-editorLayout {
    display: flex;
    flex-direction: column;
  }
  &-jsonEditor {
    flex-grow: 1;
  }

  &-mappingLayout {
    display: flex;
    flex-direction: column;
  }
  &-mapping {
    flex: 1 1 1px;
    margin-bottom: 0;
  }
}
</style>

<script>
import JsonEditor from '../../../Common/JsonEditor'
import Focus from '../../../../directives/focus.directive'
import JsonFormatter from '../../../../directives/json-formatter.directive'

export default {
  name: 'DocumentCreateOrUpdate',
  components: {
    JsonEditor
  },
  directives: {
    Focus,
    JsonFormatter
  },
  props: {
    index: String,
    collection: String,
    id: String,
    document: { type: Object, default: () => ({}) },
    mapping: Object
  },
  data() {
    return {
      idValue: null,
      submitting: false,
      rawDocument: '{}'
    }
  },
  computed: {
    documentState() {
      try {
        return JSON.parse(this.rawDocument)
      } catch (error) {
        return {}
      }
    },
    isDocumentValid() {
      try {
        JSON.parse(this.rawDocument)
        return true
      } catch (error) {
        return false
      }
    }
  },
  methods: {
    onDocumentChange(val) {
      this.rawDocument = val
    },
    submit(replace = false) {
      if (this.submitting) {
        return
      }

      if (this.isDocumentValid) {
        this.submitting = true
        this.$emit('submit', { ...this.documentState }, this.idValue, replace)
        this.submitting = false
      } else {
        this.$bvToast.toast(
          'The JSON specification of the document contains errors',
          {
            title: 'You cannot proceed',
            variant: 'info',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          }
        )
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        this.idValue = val
      }
    },
    document: {
      immediate: true,
      handler(val) {
        this.rawDocument = JSON.stringify(val, null, 2)
      }
    }
  }
}
</script>
