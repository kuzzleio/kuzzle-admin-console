<template>
  <div class="DocumentCreateOrUpdate">
    <b-card class="h-100">
      <b-card-body class="h-100 m-0 p-0">
        <b-row>
          <b-col lg="7" md="10" class="d-flex flex-column">
            <b-form-group
              label="Document ID"
              label-cols="3"
              :description="!id ? 'Leave blank to let Kuzzle auto-generate the ID' : ''"
            >
              <b-input v-model="idValue" :disabled="!!id" data-cy="DocumentCreate-input--id" />
            </b-form-group>
          </b-col>
          <b-col lg="4" md="2" class="d-flex flex-column mt-2">
            <b-form-checkbox v-model="formViewEnabled" data-cy="formView-switch" switch>
              Form view
            </b-form-checkbox>
          </b-col>
        </b-row>

        <!-- Form view-->
        <b-row v-if="formViewEnabled" class="full-height-row">
          <b-col lg="12" md="12" class="d-flex flex-column">
            <b-alert
              data-cy="form-view-warning"
              variant="warning"
              :show="formSchema.unavailable.length > 0"
            >
              The following fields are not supported in the form view:
              <span class="font-weight-bold"> {{ formSchema.unavailable.join(', ') }}</span
              >. Please use the JSON view if you want to update these values.
              <i
                id="supported-types-tooltip"
                class="fas fa-question-circle"
                :title="`The form view only supports these types: ${supportedTypes.join(', ')}.`"
              />
            </b-alert>
            <!--
              TODO - WARNING: We're passing a prop here, while the form generator
              mutates the value of the model. We should instead pass a local state
              to avoid the anti-pattern of mutating props.
            -->
            <vue-form-generator
              :schema="formSchema"
              :model="document"
              @model-updated="onFormChange"
            />
          </b-col>
        </b-row>
        <!-- Json view -->
        <b-row v-else class="full-height-row">
          <b-col lg="7" md="12" class="d-flex flex-column">
            <json-editor
              id="document"
              ref="jsoneditor"
              class="DocumentCreateOrUpdate-jsonEditor"
              :content="rawDocument"
              @change="onJsonChange"
            />
          </b-col>

          <!-- Mapping -->
          <b-col lg="5" md="12" class="d-flex flex-column">
            <h3>Mapping</h3>

            <pre
              v-json-formatter="{
                content: mapping,
                open: true,
              }"
              class="DocumentCreateOrUpdate-mapping"
            />
          </b-col>
        </b-row>
      </b-card-body>
      <template #footer>
        <div class="text-right">
          <b-button @click="$emit('cancel')">Cancel</b-button>
          <b-button
            v-if="!id"
            data-cy="DocumentCreate-btn"
            variant="primary"
            class="ml-2"
            :disabled="submitting || !isDocumentValid"
            @click="submit"
          >
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

<script>
import Focus from '@/directives/focus.directive';
import JsonFormatter from '@/directives/json-formatter.directive';
import { formSchemaService, typesCorrespondance } from '@/services/formSchema';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'DocumentCreateOrUpdate',
  components: {
    JsonEditor,
  },
  directives: {
    Focus,
    JsonFormatter,
  },
  props: {
    index: String,
    collection: String,
    id: String,
    document: { type: Object },
    mapping: Object,
  },
  data() {
    return {
      idValue: null,
      submitting: false,
      rawDocument: '{}',
      formViewEnabled: false,
    };
  },
  computed: {
    formSchema() {
      return formSchemaService.generate(this.mapping, this.document);
    },
    supportedTypes() {
      return Object.keys(typesCorrespondance);
    },
    documentState() {
      try {
        return JSON.parse(this.rawDocument);
      } catch (error) {
        return {};
      }
    },
    isDocumentValid() {
      try {
        JSON.parse(this.rawDocument);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        this.idValue = val;
      },
    },
    document: {
      immediate: true,
      handler(val) {
        this.rawDocument = JSON.stringify(val, null, 2);
      },
    },
  },
  methods: {
    onJsonChange(val) {
      this.rawDocument = val;
      let parsed = {};
      try {
        parsed = JSON.parse(val);
        this.$emit('document-change', parsed);
      } catch (error) {
        // Fail silently
      }
    },
    onFormChange() {
      this.rawDocument = JSON.stringify(this.document, null, 2);
    },
    submit(replace = false) {
      if (this.submitting) {
        return;
      }

      if (this.isDocumentValid) {
        this.submitting = true;
        this.$emit(
          'submit',
          this.formViewEnabled ? { ...this.document } : { ...this.documentState },
          this.idValue,
          replace,
        );
        this.submitting = false;
      } else {
        this.$bvToast.toast('The JSON specification of the document contains errors', {
          title: 'You cannot proceed',
          variant: 'info',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
      }
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.DocumentCreateOrUpdate {
  flex-grow: 1;

  &-jsonEditor {
    flex-grow: 1;
  }
  &-mapping {
    flex: 1 1 1px;
    margin-bottom: 0;
    overflow: auto;
  }
}
</style>

<style lang="scss">
.full-height-row {
  height: 90%;
}
</style>
