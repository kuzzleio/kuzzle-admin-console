<template>
  <div class="wrapper">
    <headline>
      Edit document - <span class="bold">{{documentToEditId}}</span>
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>
    <div class="row" v-if="show">
      <div class="card horizontal tertiary col m5">
        <div class="card-content">
          <span class="card-title">Warning</span>
          <p>This document has been edited while you were editing it. <a href="#" @click.prevent="fetch">Click here to refresh it</a></p>
        </div>
      </div>
    </div>
    <create-or-update
      @document-create::create="update"
      @document-create::cancel="cancel"
      :index="index"
      :collection="collection"
      :hide-id="true">
    </create-or-update>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .bold {
    font-weight: normal;
  }
</style>

<script>
  import CollectionDropdown from '../Collections/Dropdown'
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import CreateOrUpdate from './Common/CreateOrUpdate'
  import {newDocument, documentToEditId} from '../../../vuex/modules/data/getters'
  import {setNewDocument} from '../../../vuex/modules/data/actions'
  import CollectionTabs from '../Collections/Tabs'

  let room

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
      update (viewState, json) {
        if (viewState === 'code') {
          if (!json) {
            this.$dispatch('toast', 'Invalid document', 'error')
            return
          }
          this.setNewDocument(json)
        }

        kuzzle
          .dataCollectionFactory(this.collection, this.index)
          .updateDocumentPromise(this.documentToEditId, this.newDocument)
          .then(() => {
            kuzzle.refreshIndex(this.index)
            this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
          })
          .catch((err) => {
            if (err) {
              this.$dispatch('toast', err.message, 'error')
            }
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
        }
      },
      fetch () {
        this.show = false
        kuzzle
          .dataCollectionFactory(this.collection, this.index)
          .fetchDocumentPromise(this.documentToEditId)
          .then(res => {
            this.setNewDocument(res.content)
            this.$broadcast('document-create::fill', res.content)
            return null
          })
          .catch(err => {
            this.$dispatch('toast', err.message, 'error')
          })
      }
    },
    vuex: {
      actions: {
        setNewDocument
      },
      getters: {
        newDocument,
        documentToEditId
      }
    },
    data () {
      return {
        show: false
      }
    },
    ready () {
      this.fetch()
      room = kuzzle
        .dataCollectionFactory(this.collection, this.index)
        .subscribe({term: {_id: this.documentToEditId}}, () => {
          this.show = true
        })
    },
    destroyed () {
      if (room) {
        room.unsubscribe()
      }
    }
  }
</script>
