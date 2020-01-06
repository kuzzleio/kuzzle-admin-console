<template>
  <div class="DocumentCreateOrUpdate">
    <div class="card-panel">
      <form class="wrapper" @submit.prevent="create">
        <div v-if="$store.direct.state.collection.allowForm" class="row" />

        <div class="row input-id">
          <div class="col s6">
            <div v-if="!hideId" class="input-field">
              <input
                id="id"
                v-focus
                type="text"
                name="collection"
                :required="mandatoryId"
                @input="updateId"
              />
              <label for="id"
                >Document identifier
                {{ !mandatoryId ? '(optional)' : '' }}</label
              >
            </div>
          </div>
          <div class="col s6">
            <div
              v-if="$store.direct.state.collection.allowForm"
              class="switch right"
            >
              <label>
                Form
                <input
                  :disabled="warningSwitch"
                  type="checkbox"
                  :checked="$store.direct.state.collection.defaultViewJson"
                  @change="switchView"
                />
                <span
                  v-title="{
                    active: warningSwitch,
                    position: 'bottom',
                    title:
                      'You have unspecified custom attribute(s). Please edit the collection definition, or remove them.'
                  }"
                  class="lever"
                />
                JSON
              </label>
            </div>

            <div
              v-if="
                !$store.direct.state.collection.allowForm && index && collection
              "
              class="DocumentCreateOrUpdate-formDisabled"
            >
              <p>Document-creation form is not enabled for this collection</p>
              <router-link
                :to="{
                  name: 'DataCollectionEdit',
                  params: { index, collection }
                }"
              >
                Enable it
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="isFormView" class="row">
          <div class="col s12 card">
            <div class="card-content">
              <json-form
                :schema="$store.direct.getters.collection.schemaMappingMerged"
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
            :class="{ s12: $store.direct.state.collection.isRealtimeOnly }"
          >
            <div class="card-content">
              <span class="card-title">{{
                hideId ? 'Document' : 'New document'
              }}</span>
              <json-editor
                id="document"
                ref="jsoneditor"
                class="document-json"
                :content="jsonDocument"
                :height="500"
                @changed="jsonChanged"
              />
            </div>
          </div>

          <!-- Mapping -->
          <div
            v-if="!$store.direct.state.collection.isRealtimeOnly"
            class="col s6 card"
          >
            <div class="card-content">
              <span class="card-title">Mapping</span>

              <pre
                v-json-formatter="{
                  content: $store.direct.getters.collection.simplifiedMapping,
                  open: true
                }"
                class="DocumentCreateOrUpdate-mapping"
              />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s7 m6 l5">
            <a class="btn-flat waves-effect" @click.prevent="cancel">
              Cancel
            </a>

            <button
              v-if="!hideId"
              type="submit"
              class="btn primary waves-effect waves-light"
              :disabled="submitted"
            >
              <i class="fa fa-plus-circle left" />
              Create
            </button>

            <button
              v-if="hideId"
              ref="update"
              type="submit"
              class="btn primary waves-effect waves-light DocumentUpdate"
              data-position="top"
              data-tooltip="Update some of a document's fields (does not remove unset attributes)."
              :disabled="submitted"
            >
              <i class="fa fa-pencil-alt left" />
              Update
            </button>

            <button
              v-if="hideId"
              ref="replace"
              class="btn primary waves-effect waves-light DocumentReplace"
              data-position="top"
              data-tooltip="Replace the content of a document."
              :disabled="submitted"
              @click.prevent="create(true)"
            >
              <i class="fa fa-fire-alt left" />
              Replace
            </button>
          </div>
          <div v-if="error" class="col s7 m8 l9">
            <div class="card error red-color">
              <i class="fa fa-times dismiss-error" @click="dismissError()" />
              <p v-html="error" />
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

  &-formDisabled {
    float: right;
    font-size: 0.9em;
    font-weight: 800;
    font-family: 'Courier New', Courier, monospace;
    color: $grey-color;
    text-align: right;
  }

  &-mapping {
    height: 500px;
    margin: 0;
    overflow-y: scroll;
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
  directives: {
    Focus,
    title,
    JsonFormatter
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
  data() {
    return {
      jsonDocument: {},
      warningSwitch: false
    }
  },
  computed: {
    isFormView() {
      return (
        !this.$store.direct.state.collection.defaultViewJson &&
        this.$store.direct.state.collection.allowForm
      )
    }
  },
  watch: {
    value: 'initJsonDocument'
  },
  mounted() {
    jsonAlreadyInit = false
    this.initJsonDocument()
    /* eslint no-undef: 0 */
    M.Tooltip.init(this.$refs.update)
    M.Tooltip.init(this.$refs.replace)
  },
  methods: {
    dismissError() {
      this.$emit('document-create::reset-error')
    },
    create(replace = false) {
      if (this.submitted) {
        return
      }

      if (!this.$store.direct.state.collection.defaultViewJson) {
        return this.$emit('document-create::create', { ...this.value }, replace)
      }

      if (this.$refs.jsoneditor.isValid()) {
        this.$emit('document-create::create', { ...this.value }, replace)
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
      this.$store.direct.dispatch.collection.setCollectionDefaultViewJson({
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
        this.$store.direct.state.collection.schema
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
  }
}
</script>
