<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <create-or-update
      @document-create::create="create"
      @document-create::cancel="cancel"
      @document-create::reset-error="error = null"
      :error="error"
      :index="index"
      :collection="collection">
    </create-or-update>
  </div>
</template>


<script>
  import CollectionDropdown from '../Collections/Dropdown'
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import CreateOrUpdate from './Common/CreateOrUpdate'
  import {newDocument} from '../../../vuex/modules/data/getters'
  import {setNewDocument} from '../../../vuex/modules/data/actions'
  import CollectionTabs from '../Collections/Tabs'

  export default {
    name: 'DocumentCreateOrUpdate',
    components: {
      Headline,
      CollectionDropdown,
      CreateOrUpdate,
      CollectionTabs
    },
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        error: ''
      }
    },
    methods: {
      create (viewState, json, mapping) {
        this.error = ''

        if (viewState === 'code') {
          if (!json) {
            this.error = 'The document is invalid, please review it'
            return
          }
          this.setNewDocument(json)
        }

        return kuzzle
          .dataCollectionFactory(this.collection, this.index)
          .dataMappingFactory(mapping || {})
          .applyPromise()
          .then(() => {
            return kuzzle
              .dataCollectionFactory(this.collection, this.index)
              .createDocumentPromise(this.newDocument)
              .then(() => {
                kuzzle.refreshIndex(this.index)
                this.$router.push({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
              })
              .catch(err => {
                this.error = 'An error occurred while trying to create the document: <br/> ' + err.message
              })
          })
          .catch(err => {
            this.error = 'An error occurred while trying to update collection mapping according to the document: <br/> ' + err.message
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
        }
      }
    },
    vuex: {
      getters: {
        newDocument
      },
      actions: {
        setNewDocument
      }
    }
  }
</script>
