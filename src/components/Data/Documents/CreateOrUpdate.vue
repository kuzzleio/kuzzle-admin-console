<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <div class="card-panel">
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

      <form class="wrapper" @submit.prevent="create">

        <!-- Form view -->
        <div class="row" v-if="viewState === 'form'">
          <div class="row">
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
            <div class="col s12">
              <fieldset>
                <div class="row">
                  <a class="btn btn-small right" @click="addRootAttr">
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
          <div class="row">
            <div class="col s6">
              <button @click.prevent="cancel" class="btn-flat waves-effect">Cancel</button>
              <button type="submit" class="btn primary waves-effect waves-light"><i class="fa fa-plus-circle left"></i>
                Create
              </button>
            </div>
          </div>
        </div>

        <!-- Json view -->
        <div class="row" v-if="viewState === 'code'">
          <json-editor class="pre_ace" :content="newDocument" v-ref:jsoneditor></json-editor>
        </div>

        <div class="row">
          <div class="col s6">
            <button type="submit" class="btn waves-effect waves-light"><i class="fa fa-plus-circle"></i> Create
            </button>
            <button @click.prevent="cancel" class="btn-flat waves-effect">Cancel</button>
          </div>
        </div>
      </form>
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

      a {
        margin-left: 10px;
        &.btn-tiny {
          padding: 0;
          height: 37px;
        }
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
</style>

<script>
  import CollectionTabs from '../Collections/Tabs.vue'
  import CollectionDropdown from '../Collections/Dropdown'
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import JsonForm from '../../Common/JsonForm/JsonForm'
  import {setNewDocument, unsetNewDocument, setPartial} from '../../../vuex/modules/data/actions'
  import {newDocument} from '../../../vuex/modules/data/getters'
  import JsonEditor from '../../Common/JsonEditor'
  import Modal from '../../Materialize/Modal'
  import MSelect from '../../../directives/Materialize/m-select.directive'
  import {addAttributeFromPath, getUpdatedSchema} from '../../../services/documentFormat'
  import {mergeDeep, formatGeoPoint} from '../../../services/objectHelper'

  export default {
    name: 'DocumentCreateOrUpdate',
    components: {
      CollectionTabs,
      CollectionDropdown,
      Headline,
      JsonForm,
      JsonEditor,
      Modal
    },
    directives: {
      MSelect
    },
    props: {
      index: String,
      collection: String
    },
    methods: {
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
        }
      },
      create () {
        if (this.viewState === 'code') {
          let json = this.$refs.jsoneditor.getJson()
          this.setNewDocument(json)
        }
        if (this.id) {
          this.setPartial('_id', this.id)
        }

        kuzzle
          .dataCollectionFactory(this.collection, this.index)
          .createDocumentPromise(this.newDocument)
          .then(() => {
            kuzzle.refreshIndex(this.index)
            this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
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
    route: {
      data () {
        kuzzle.dataCollectionFactory(this.collection, this.index).getMapping((err, res) => {
          if (err) {
            return
          }
          this.mapping = res.mapping
          formatGeoPoint(this.mapping)
        })
      }
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
