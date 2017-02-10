<template>
  <div>
    <div class="card-panel">
      <form class="wrapper" @submit.prevent="create">

        <div class="row input-id" v-if="!hideId">
          <div class="col s6">
            <div class="input-field">
              <input id="id" type="text" name="collection" v-model="id" v-focus :required="mandatoryId" />
              <label for="id">Document identifier {{!mandatoryId ? '(optional)' : ''}}</label>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s12 card">
            <div class="card-content">
              <json-form :schema="$store.getters.schemaMappingMerged" @update-value="updateValue" :document="document">
              </json-form>
            </div>
          </div>
        </div>

        <!-- Json view -->
        <div class="row">
          <div class="col s6 card">
            <div class="card-content">
              <span class="card-title">{{hideId ? 'Document' : 'New document'}}</span>
              <json-editor id="document" class="pre_ace" :content="document" ref="jsoneditor"></json-editor>
            </div>
          </div>

          <!-- Mapping -->
          <div class="col s6 card">
            <div class="card-content">
              <span class="card-title">Mapping</span>
              <json-editor id="mapping" class="pre_ace" :content="$store.getters.simplifiedMapping" :readonly="true"></json-editor>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s5 m4 l3">
            <a @click.prevent="cancel" class="btn-flat waves-effect">
              Cancel
            </a>
            <button type="submit" class="btn primary waves-effect waves-light">
              <i v-if="!hideId" class="fa fa-plus-circle left"></i>
              <i v-else class="fa fa-pencil left"></i>
              {{hideId ? 'Update' : 'Create'}}
            </button>
          </div>
          <div class="col s7 m8 l9" v-if="error">
            <div class="card error red-color">
              <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
              <p v-html="error">
            </div>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
  .input-id {
    margin-bottom: 0;
  }
  .pre_ace, .ace_editor {
    height: 500px;
  }
  .error {
    position: relative;
    padding: 8px 12px;
    margin: 0;
  }
  .dismiss-error {
    position: absolute;
    right: 10px;
    cursor: pointer;
    padding: 3px;
    border-radius: 2px;

    &:hover {
      background-color: rgba(255, 255, 255, .2);
    }
  }
</style>

<script>
  import JsonForm from '../../../Common/JsonForm/JsonForm'
  import JsonEditor from '../../../Common/JsonEditor'
  import Focus from '../../../../directives/focus.directive'

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
        'default': false,
        type: Boolean
      },
      document: Object,
      getMapping: {type: Function, required: true}
    },
    directives: {
      Focus
    },
    data () {
      return {
        newAttributeType: 'string',
        newAttributePath: null,
        newAttributeName: null,
        big: false,
        showAnyway: false,
        isOpen: false,
        id: null
      }
    },
    methods: {
      dismissError () {
        this.$emit('document-create::reset-error')
      },
      create () {
        this.$emit('document-create::create', this.document)
      },
      cancel () {
        this.$emit('document-create::cancel')
      },
      updateValue (e) {
        this.document[e.name] = e.value
      }
    }
  }
</script>
