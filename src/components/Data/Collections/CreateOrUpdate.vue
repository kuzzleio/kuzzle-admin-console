<template>
  <div class="CollectionCreateOrUpdate d-flex flex-column h-100">
    <headline>
      <span class="CollectionCreateOrUpdate-index code text-secondary">
        {{ index }}
        <i class="fa fa-angle-right" />
      </span>
      {{ headline }}
    </headline>

    <b-card class="flex-grow" body-class="d-flex flex-column">
      <template #footer>
        <div class="text-right">
          <b-button class="mr-2" :to="{ name: 'Collections', params: { indexName: index } }"
            >Cancel</b-button
          >
          <b-button data-cy="CollectionCreateOrUpdate-submit" variant="primary" @click="onSubmit">{{
            submitLabel
          }}</b-button>
        </div>
      </template>
      <b-form-group
        id="collection-name"
        data-cy="CollectionCreateOrUpdate-name"
        label="Collection name"
        label-for="collection-name-input"
        label-cols-sm="3"
      >
        <template #description>
          <span v-if="collection">This field cannot be updated</span>
          <span v-else>This field is mandatory</span>
        </template>
        <template v-if="v$.name.required.$invalid" #invalid-feedback
          >Please fill-in a valid collection name.
        </template>
        <template v-else-if="v$.name.isValidCollectionName.$invalid" #invalid-feedback
          >The name you entered is invalid.
          <a target="_blank" href="https://docs.kuzzle.io/core/2/api/controllers/collection/create/"
            >Read more about how to choose a valid name</a
          >
        </template>

        <b-input
          id="collection-name-input"
          v-model="v$.name.$model"
          type="text"
          name="collection"
          tabindex="1"
          :disabled="!!collection"
          :state="nameInputState"
        />
      </b-form-group>

      <template>
        <b-row class="mb-3">
          <b-col cols="12">
            <b-form-file
              ref="file-input"
              class="float-left mr-3 w-50"
              placeholder="Select a JSON file to import mappings.."
              @change="loadMappingValue($event)"
            />
            <b-button
              class="float-left"
              data-cy="export-collection-mapping"
              :download="mappingFileName"
              :href="downloadMappingValue"
              :disabled="!isMappingValid"
            >
              Export Mapping
            </b-button>
          </b-col>
        </b-row>
        <b-row class="flex-grow">
          <b-col cols="8">
            <json-editor
              id="collection"
              ref="jsoneditor"
              tabindex="4"
              myclass="h-100"
              :content="rawMapping"
              @change="onMappingChanged"
            />
          </b-col>

          <b-col cols="4">
            <div class="d-flex flex-column h-100 text-secondary">
              <div class="CollectionCreateOrUpdate-help">
                You can (optionally) use this editor to define the mappings for this collection.
                <br />
                The mappings of a collection is the definition of how each document in the
                collection (and its fields) are stored and indexed.
                <a
                  href="https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-policy"
                  target="_blank"
                  >Read more about mappings</a
                >
                <br /><br />
                For example:
                <pre>
{
  "properties": {
    "age": { "type": "integer" },
    "name": { "type": "keyword" }
  }
}
              </pre
                >
              </div>
            </div>
          </b-col>
        </b-row>
      </template>
    </b-card>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { requiredUnless } from '@vuelidate/validators';
import { mapGetters } from 'vuex';

import JsonEditor from '../../Common/JsonEditor.vue';
import Headline from '../../Materialize/Headline.vue';
import Focus from '@/directives/focus.directive';

function isValidCollectionName(value) {
  const containsDisallowed = /\\\\|\/|\*|\?|"|<|>|\||\s|,|#|:|%|&|\./.test(value);
  const containsUpperCase = /[A-Z]/.test(value);
  const isTooLong = new TextEncoder().encode(value).length > 128;
  return !containsDisallowed && !containsUpperCase && !isTooLong;
}

export default {
  name: 'CollectionCreateOrUpdate',
  components: {
    Headline,
    JsonEditor,
  },
  directives: {
    Focus,
  },
  props: {
    index: { type: String, required: true },
    collection: String,
    headline: String,
    submitLabel: { type: String, default: 'OK' },
    mapping: {
      type: Object,
      default: () => ({
        properties: {},
      }),
    },
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      name: this.collection || '',
      rawMapping: '{}',
    };
  },
  validations() {
    return {
      name: {
        required: requiredUnless(() => !!this.collection),
        isValidCollectionName,
      },
      rawMapping: {
        syntaxOK: function (value) {
          try {
            JSON.parse(value);
          } catch (e) {
            return false;
          }
          return true;
        },
      },
    };
  },
  computed: {
    ...mapGetters('kuzzle', ['currentEnvironment']),
    indexName() {
      return this.$route.params.indexName;
    },
    collectionName() {
      return this.$route.params.collectionName;
    },
    mappingFileName() {
      return `${this.currentEnvironment.name}-${this.indexName}-${this.name}-mapping.json`;
    },
    nameInputState() {
      const { $dirty, $error } = this.v$.name;
      const state = $dirty ? !$error : null;
      return state;
    },
    mappingState() {
      try {
        return JSON.parse(this.rawMapping);
      } catch (error) {
        return {};
      }
    },
    isMappingValid() {
      try {
        JSON.parse(this.rawMapping);
        return true;
      } catch (error) {
        return false;
      }
    },
    downloadMappingValue() {
      if (this.isMappingValid) {
        const blob = new Blob([JSON.stringify(JSON.parse(this.rawMapping))], {
          type: 'application/json',
        });
        return window.URL.createObjectURL(blob);
      }
      return null;
    },
  },
  watch: {
    mapping: {
      immediate: true,
      handler(val) {
        try {
          this.rawMapping = JSON.stringify(val, null, 2);
        } catch (error) {
          this.$log.error(error);
        }
      },
    },
    collection: {
      immediate: true,
      handler(v) {
        this.name = v;
      },
    },
  },
  methods: {
    loadMappingValue(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.rawMapping = e.target.result;
        this.$refs.jsoneditor.setContent(this.rawMapping);
        this.$bvToast.toast(
          'The file has been written in the json editor. You can still edit it before saving if necessary.',
          {
            title: 'Import successfully',
            variant: 'success',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true,
          },
        );
      };
      reader.readAsText(file);
    },
    onMappingChanged(value) {
      this.rawMapping = value;
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to);
      } else {
        this.$router.push({
          name: 'Indexes',
          params: { index: this.index },
        });
      }
    },
    onSubmit() {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }

      if (!this.isMappingValid) {
        this.$bvToast.toast('The JSON specification of the mapping contains syntax errors', {
          title: 'You cannot proceed',
          variant: 'info',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
      }

      this.$emit('submit', {
        name: this.name,
        mapping: this.mappingState,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.CollectionCreateOrUpdate {
  &-help {
    flex: 1 1 1px;
    overflow: auto;
  }
}
</style>
