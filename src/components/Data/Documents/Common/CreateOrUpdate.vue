<template>
  <div>
    <div class="card-panel">
      <div class="row">
        <div class="switch">
          <label>
            Form
            <input type="checkbox" @click="switchEditMode" />
            <span class="lever"></span>
            Json
          </label>
        </div>
      </div>

      <form class="wrapper" @submit.prevent="create">

        <!-- Form view -->
        <div class="row" v-if="viewState === 'form'">
          <div class="row" v-if="!hideId">
            <div class="col s6">
              <div class="input-field">
                <input id="id" type="text" name="collection" @input="updatePartial" v-focus />
                <label for="id">Document identifier (optional)</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="divider"></div>
          </div>

          <div class="row">
            <div class="col s7">
              <fieldset>
                <div class="row">
                  <a class="btn btn-small" @click="addRootAttr">
                    <i class="fa fa-plus-circle left"></i>
                    new attribute
                  </a>
                </div>
                <div v-for="(name, content) in mapping">
                  <json-form :name="name" :content="content"></json-form>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <!-- Json view -->
        <div class="row" v-if="viewState === 'code'">
          <json-editor class="pre_ace" :content="newDocument" v-ref:jsoneditor></json-editor>
        </div>

        <div class="row">
          <div class="col s6">
            <a @click.prevent="cancel" class="btn-flat waves-effect">
              Cancel
            </a>
            <button type="submit" class="btn waves-effect waves-light">
              <i v-if="!hideId" class="fa fa-plus-circle left"></i>
              <i v-else class="fa fa-pencil left"></i>
              {{hideId ? 'Update' : 'Create'}}
            </button>
          </div>
        </div>

      </form>
    </div>

    <modal id="add-attr">
      <h4>Add a new attribute</h4>
      <form>
        <p>
          <div class="input-field">
            <input id="name" type="text" required v-model="newAttributeName"/>
            <label for="name">Field name</label>
          </div>
          <div class="input-field">
            <select v-m-select="newAttributeType">
              <option value="string" selected>String</option>
              <option value="number">Number</option>
              <option value="nested">Object</option>
              <option value="geopos">Geo position</option>
            </select>
            <label>Attribute type</label>
          </div>
        </p>

        <span slot="footer">
          <button
            type="submit"
            class="waves-effect waves-green btn"
            @click="doAddAttr">
              Add
          </button>
          <a class="btn-flat" @click.prevent="$broadcast('modal-close', 'add-attr')">
              Cancel
          </a>
        </span>
      </form>
    </modal>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
  .pre_ace, .ace_editor {
    height: 350px;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    legend {
      border: 0;
      padding: 0;
      font-weight: 300;
      left: -4px;
      position: absolute;
      top: -27px;
      font-family: "Roboto", Arial, sans-serif;

      i {
        font-size: 1.3em;
        cursor: pointer;
      }
    }
    fieldset {
      border-left: solid 3px #EEE;
      position: relative;
      margin: 45px 0 15px 0;
      padding: 0 0 0 1em;
      &:hover, &:focus, &.active {
        border-left: solid 3px #DDD;
      }
    }
  }

  .input-field {
    a.btn-tiny {
      position: absolute;
      right: 0;
      top: 0;
      height: 37px;
      padding: 0;
    }
  }
</style>

<script>
  import kuzzle from '../../../../services/kuzzle'
  import JsonForm from '../../../Common/JsonForm/JsonForm'
  import {setNewDocument, unsetNewDocument, setPartial} from '../../../../vuex/modules/data/actions'
  import {newDocument} from '../../../../vuex/modules/data/getters'
  import JsonEditor from '../../../Common/JsonEditor'
  import Modal from '../../../Materialize/Modal'
  import MSelect from '../../../../directives/Materialize/m-select.directive'
  import {addAttributeFromPath, getUpdatedSchema} from '../../../../services/documentFormat'
  import {mergeDeep, formatGeoPoint} from '../../../../services/objectHelper'
  import Focus from '../../../../directives/focus.directive'

  export default {
    name: 'DocumentCreateOrUpdate',
    components: {
      JsonForm,
      JsonEditor,
      Modal
    },
    props: {
      index: String,
      collection: String,
      hideId: Boolean
    },
    directives: {
      MSelect,
      Focus
    },
    methods: {
      create () {
        let json

        if (this.viewState === 'code') {
          json = this.$refs.jsoneditor.getJson()
        }

        this.$dispatch('document-create::create', this.viewState, json)
      },
      switchEditMode () {
        if (this.viewState === 'code') {
          let json = this.$refs.jsoneditor.getJson()
          if (json) {
            mergeDeep(this.mapping, getUpdatedSchema(json).properties)
          }
          this.viewState = 'form'
          return
        }
        this.viewState = 'code'
      },
      addRootAttr () {
        this.newAttributePath = '/'
        this.$broadcast('modal-open', 'add-attr')
      },
      doAddAttr () {
        addAttributeFromPath(this.mapping, this.newAttributePath, this.newAttributeName, (this.newAttributeType === 'nested' ? {properties: {}} : {type: this.newAttributeType}))
        this.newAttributeType = 'string'
        this.newAttributeName = null
        this.newAttributePath = null
        this.$broadcast('modal-close', 'add-attr')
      },
      updatePartial (e) {
        this.setPartial('_id', e.target.value)
      },
      cancel () {
        this.$dispatch('document-create::cancel')
      }
    },
    vuex: {
      actions: {
        setNewDocument,
        unsetNewDocument,
        setPartial
      },
      getters: {
        newDocument
      }
    },
    beforeDestroy () {
      this.unsetNewDocument()
    },
    data () {
      return {
        mapping: {},
        viewState: 'form',
        newAttributeType: 'string',
        newAttributePath: null,
        newAttributeName: null
      }
    },
    ready () {
      kuzzle
        .dataCollectionFactory(this.collection, this.index)
        .getMappingPromise()
        .then((res) => {
          this.mapping = res.mapping
          formatGeoPoint(this.mapping)
        })
        .catch(() => {
          // todo errors
        })
    },
    events: {
      'document-create::add-attribute' (path) {
        this.newAttributePath = path
        this.$broadcast('modal-open', 'add-attr')
      },
      'document-create::fill' (document) {
        this.mapping = mergeDeep(this.mapping, getUpdatedSchema(document).properties)
      }
    }
  }
</script>
