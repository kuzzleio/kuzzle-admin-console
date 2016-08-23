<template>
  <div class="row">
    <div class="switch">
      <label>
        Form
        <input type="checkbox" @click="switchEditMode">
        <span class="lever"></span>
        Json
      </label>
    </div>
  </div>

  <div class="row">
    <div class="col s12 m10 l8 card">

      <form class="wrapper" @submit.prevent="create">
        <!-- Form view -->
        <div class="row" v-if="viewState === 'form'">
          <div class="row">
            <!-- Collection name -->
            <div class="col s6">
              <div class="input-field">
                <input id="id" type="text" name="collection" v-model="id"/>
                <label for="id">Document identifier (optional)</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="divider"></div>
          </div>

          <div class="row">
            <div class="col m11">
              <fieldset>
                <div class="row">
                  <a class="btn btn-small right" @click="addRootAttr"><i class="fa fa-plus-circle left"></i>new
                    attribute</a>
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

        <slot></slot>

      </form>
    </div>
  </div>

  <modal id="add-attr">
    <h4>Add a new attribute</h4>
    <p>
    <form>
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
    </form>
    </p>

    <span slot="footer">
        <button
          href="#"
          class="waves-effect waves-green btn"
          @click="doAddAttr">
            Add
        </button>
        <button href="#" class="btn-flat" @click.prevent="$broadcast('modal-close', 'add-attr')">
            Cancel
        </button>
      </span>
  </modal>
  </div>
</template>

<style scoped>
  .pre_ace, .ace_editor {
    height: 350px;
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

  export default {
    name: 'DocumentCreateOrUpdate',
    components: {
      JsonForm,
      JsonEditor,
      Modal
    },
    props: {
      index: String,
      collection: String
    },
    directives: {
      MSelect
    },
    methods: {
      create () {
        if (this.id) {
          this.setPartial('_id', this.id)
        }
        this.$dispatch('document-create::create', this.viewState, this.json)
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
        id: '',
        mapping: {},
        viewState: 'form',
        newAttributeType: 'string',
        newAttributePath: null,
        newAttributeName: null
      }
    },
    ready () {
      kuzzle.dataCollectionFactory(this.collection, this.index).getMapping((err, res) => {
        if (err) {
          return
        }
        this.mapping = res.mapping
        formatGeoPoint(this.mapping)
      })
    },
    events: {
      // todo rename event
      'add-attribute' (path) {
        this.newAttributePath = path
        this.$broadcast('modal-open', 'add-attr')
      }
    }
  }
</script>