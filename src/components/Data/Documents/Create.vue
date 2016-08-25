<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Create a document
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <create-or-update @document-create::create="create" :index="index" :collection="collection">
      <div class="row">
        <div class="col s6">
          <button @click.prevent="cancel" class="btn-flat waves-effect">Cancel</button>
          <button type="submit" class="btn waves-effect waves-light"><i class="fa fa-plus-circle"></i> Create</button>
        </div>
      </div>
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

  export default {
    name: 'DocumentCreateOrUpdate',
    components: {
      Headline,
      CollectionDropdown,
      CreateOrUpdate
    },
    props: {
      index: String,
      collection: String
    },
    methods: {
      create (viewState, json) {
        if (viewState === 'code') {
          if (!json) {
            this.$dispatch('toast', 'Invalid document', 'error')
            return
          }
          this.setNewDocument(json)
        }
        kuzzle
          .dataCollectionFactory(this.collection, this.index)
          .createDocumentPromise(this.newDocument)
          .then(() => {
            kuzzle.refreshIndex(this.index)
            this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
          }).catch(err => {
            this.$dispatch('toast', err.message, 'error')
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
