<template>
  <div class="DocumentCreateOrUpdate">
    <div class="card-panel">
      <form class="wrapper" @submit.prevent="create">

        <div class="row" v-if="$store.state.collection.allowForm">

        </div>

        <div class="row input-id">
          <div class="col s6">
            <div class="input-field" v-if="!hideId">
              <input id="id" type="text" name="collection" @input="updateId" v-focus :required="mandatoryId" />
              <label for="id">Document identifier {{!mandatoryId ? '(optional)' : ''}}</label>
            </div>
          </div>
          <div class="col s6">
            <div
              class="switch right"
              v-if="$store.state.collection.allowForm"
              >
              <label>
                Form
                <input :disabled="warningSwitch" type="checkbox" @change="switchView" :checked="$store.state.collection.defaultViewJson">
                <span
                  class="lever"
                  v-title="{
                  active: warningSwitch,
                  position: 'bottom',
                  title: 'You have unspecified custom attribute(s). Please edit the collection definition, or remove them.'
                  }">
                </span>
                JSON
              </label>
            </div>

            <div
              v-if="!$store.state.collection.allowForm && index && collection"
              class="DocumentCreateOrUpdate-formDisabled"
              >
                <p>Document-creation form is not enabled for this collection</p>
                <router-link :to="{name: 'DataCollectionEdit', params: {index, collection}}">Enable it</router-link>
            </div>
          </div>
        </div>

        <div class="row" v-if="isFormView">
          <div class="col s12 card">
            <div class="card-content">
              <json-form :schema="$store.getters.schemaMappingMerged" @update-value="updateValue" :document="value">
              </json-form>
            </div>
          </div>
        </div>

        <!-- Json view -->
        <div class="row json-view" v-if="!isFormView">
          <div class="col s6 card" :class="{s12: $store.state.collection.isRealtimeOnly}">
            <div class="card-content">
              <span class="card-title">{{hideId ? 'Document' : 'New document'}}</span>
              <json-editor id="document" class="document-json" :content="jsonDocument" ref="jsoneditor" @changed="jsonChanged" :height="500"></json-editor>
            </div>
          </div>

          <!-- Mapping -->
          <div class="col s6 card" v-if="!$store.state.collection.isRealtimeOnly">
            <div class="card-content">
              <span class="card-title">Mapping</span>

              <pre class="DocumentCreateOrUpdate-mapping" v-json-formatter="{content: $store.getters.simplifiedMapping, open: true}"></pre>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s5 m4 l3">
            <a @click.prevent="cancel" class="btn-flat waves-effect">
              Cancel
            </a>
            <button type="submit" class="btn primary waves-effect waves-light" :disabled="submitted">
              <i v-if="!hideId" class="fa fa-plus-circle left"></i>
              <i v-else class="fa fa-pencil left"></i>
              {{hideId ? 'Update' : 'Create'}}
            </button>
          </div>
          <div class="col s7 m8 l9" v-if="error">
            <div class="card error red-color">
              <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
              <p v-html="error"></p>
            </div>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
// @TODO format this code to BEM
.DocumentCreateOrUpdate {
  max-width: $container-width;

  form.wrapper {
    padding-top: 0;
  }

  .json-view {
    .document-json {
      .pre_ace,
      .ace_editor {
        height: 500px;
      }

      .field-json {
        .pre_ace,
        .ace_editor {
          height: 500px;
        }
      }
    }
  }

  .DocumentCreateOrUpdate-formDisabled {
    float: right;
    font-size: 0.9em;
    font-weight: 800;
    font-family: 'Courier New', Courier, monospace;
    color: $grey-color;
    text-align: right;
  }

  .DocumentCreateOrUpdate-mapping {
    height: 500px;
    margin: 0;
  }

  .input-id {
    margin-bottom: 0;
  }
  .error {
    position: relative;
    padding: 8px 12px;
    margin: 0;
    color: #ffffff;
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
}
</style>

<script>
import JsonForm from '../../../Common/JsonForm/JsonForm'
import JsonEditor from '../../../Common/JsonEditor'
import Focus from '../../../../directives/focus.directive'
import title from '../../../../directives/title.directive'
import JsonFormatter from '../../../../directives/json-formatter.directive'
import { SET_COLLECTION_DEFAULT_VIEW_JSON } from '../../../../vuex/modules/collection/mutation-types'
import { hasSameSchema } from '../../../../services/collectionHelper'

// We have to init the JSON only if the data comes from the server.
// This flag allow to not trigger an infinite loop when the doc is updated
let jsonAlreadyInit = false

export default {
  name: 'DocumentCreateOrUpdate',
  components: {
    JsonForm,
    JsonEditor
  },
  props: {
    error: String,
    index: String,
    collection: String,
    hideId: Boolean,
    mandatoryId: {
      default: false,
      type: Boolean
    },
    value: Object,
    submitted: {
      type: Boolean,
      default: false
    }
  },
  directives: {
    Focus,
    title,
    JsonFormatter
  },
  data() {
    return {
      jsonDocument: {},
      warningSwitch: false
    }
  },
  methods: {
    dismissError() {
      this.$emit('document-create::reset-error')
    },
    create() {
      if (this.submitted) {
        return
      }

      if (!this.$store.state.collection.defaultViewJson) {
        return this.$emit('document-create::create', { ...this.value })
      }

      if (this.$refs.jsoneditor.isValid()) {
        this.$emit('document-create::create', { ...this.value })
      } else {
        this.$emit('document-create::error', 'Invalid JSON provided.')
      }
    },
    cancel() {
      this.$emit('document-create::cancel')
    },
    updateValue(e) {
      this.$emit('input', { ...this.value, [e.name]: e.value })
    },
    switchView(e) {
      this.$store.dispatch(SET_COLLECTION_DEFAULT_VIEW_JSON, {
        index: this.$route.params.index,
        collection: this.$route.params.collection,
        jsonView: e.target.checked
      })
      this.jsonDocument = { ...this.value }
    },
    updateId(e) {
      this.$emit('change-id', e.target.value)
    },
    jsonChanged(json) {
      this.warningSwitch = !hasSameSchema(
        json,
        this.$store.state.collection.schema
      )
      this.$emit('input', json)
      jsonAlreadyInit = true
    },
    initJsonDocument() {
      if (!jsonAlreadyInit) {
        if (this.value) {
          if (!Object.keys(this.value).length) {
            this.jsonDocument = {}
            return
          }

          this.jsonDocument = { ...this.value }
          jsonAlreadyInit = true
        }
      }
    }
  },
  computed: {
    isFormView() {
      return (
        !this.$store.state.collection.defaultViewJson &&
        this.$store.state.collection.allowForm
      )
    }
  },
  mounted() {
    jsonAlreadyInit = false
    this.initJsonDocument()
  },
  watch: {
    value: 'initJsonDocument'
  }
}
</script>
