<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Create a document
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <div class="row">
      <div class="input-field col m2">
        <input id="id" type="text" name="collection" v-model="id" />
        <label for="id">Id (optional)</label>
      </div>
    </div>

    <div class="row">
      <div class="col m11">
        <fieldset>
          <div v-for="(name, content) in mapping">
            <json-form :name="name" :content="content"></json-form>
          </div>
        </fieldset>
      </div>
    </div>
    <button @click.prevent="create" class="btn waves-effect waves-light"><i class="fa fa-plus-circle"></i> Create</button>
    <button @click.prevent="cancel" class="btn-flat waves-effect">Cancel</button>
  </div>
</template>

<script>
  import CollectionDropdown from '../Collections/Dropdown'
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import JsonForm from './JsonForm'
  import {unsetNewDocument} from '../../../vuex/modules/data/actions'
  import {newDocument} from '../../../vuex/modules/data/getters'

  export default {
    name: 'DocumentCreate',
    components: {
      CollectionDropdown,
      Headline,
      JsonForm
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
          this.$router.go({name: 'DataCollectionBrowse', params: {index: this.index, collection: this.collection}})
        }
      },
      create () {
        if (this.id) {
          this.newDocument._id = this.id
        }
        kuzzle.dataCollectionFactory(this.collection, this.index).createDocument(this.newDocument, (err, res) => {
          if (err) {
            this.$dispatch('toast', err.message, 'error')
            return
          }
          kuzzle.refreshIndex(this.index)
          this.$router.go({name: 'DataCollectionBrowse', params: {index: this.index, collection: this.collection}})
        })
      }
    },
    vuex: {
      actions: {
        unsetNewDocument
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
        mapping: null
      }
    },
    route: {
      data () {
        kuzzle.dataCollectionFactory(this.collection, this.index).getMapping((err, res) => {
          if (err) {
            return
          }
          this.mapping = res.mapping
        })
      }
    }
  }
</script>
