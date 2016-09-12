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
    methods: {
      create (viewState, json, mapping) {
        if (viewState === 'code') {
          if (!json) {
            this.$dispatch('toast', 'Invalid document', 'error')
            return
          }
          this.setNewDocument(json)
        }

        kuzzle
          .dataCollectionFactory(this.collection, this.index)
          .dataMappingFactory(mapping || {})
          .applyPromise()
          .then(() => {
            kuzzle
              .dataCollectionFactory(this.collection, this.index)
              .createDocumentPromise(this.newDocument)
              .then(() => {
                kuzzle.refreshIndex(this.index)
                this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
              })
              .catch(err => {
                this.$dispatch('toast', 'Bad mapping: ' + err.message, 'error')
              })
          })
          .catch(err => {
            this.$dispatch('toast', 'Bad document: ' + err.message, 'error')
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
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
