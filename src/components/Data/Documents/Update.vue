<template>
  <div class="wrapper">
    <headline>
      Edit document - <span class="bold">{{decodeURIComponent($store.state.route.params.id)}}</span>
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
      @document-create::reset-error="error = null"
      :error="error"
      :index="index"
      :collection="collection"
      :hide-id="true"
      :document="document"
      :get-mapping="getMappingDocument">
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
  import { getMappingDocument } from '../../../services/kuzzleWrapper'
  import CreateOrUpdate from './Common/CreateOrUpdate'
  import CollectionTabs from '../Collections/Tabs'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  let room

  export default {
    name: 'DocumentUpdate',
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
        error: '',
        show: false,
        document: {}
      }
    },
    methods: {
      getMappingDocument,
      update (json, mapping) {
        this.error = ''

        if (!json) {
          this.error = 'The document is invalid, please review it'
          return
        }

        return kuzzle
          .collection(this.collection, this.index)
          .collectionMapping(mapping || {})
          .applyPromise()
          .then(() => {
            return kuzzle
              .collection(this.collection, this.index)
              .updateDocumentPromise(decodeURIComponent(this.$store.state.route.params.id), json, {refresh: 'wait_for'})
              .then(() => {
                this.$router.push({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
              })
              .catch((err) => {
                this.error = 'An error occurred while trying to update the document: <br/> ' + err.message
              })
          })
          .catch(err => {
            this.error = 'An error occurred while trying to update collection mapping according to the document: <br/> ' + err.message
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.push(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
        }
      },
      fetch () {
        this.show = false
        kuzzle
          .collection(this.collection, this.index)
          .fetchDocumentPromise(decodeURIComponent(this.$store.state.route.params.id))
          .then(res => {
            this.document = res.content
            this.$emit('document-create::fill', res.content)
            return null
          })
          .catch(err => {
            this.$store.commit(SET_TOAST, {text: err.message})
          })
      }
    },
    mounted () {
      this.fetch()
      kuzzle
        .collection(this.collection, this.index)
        .subscribe({term: {_id: decodeURIComponent(this.$store.state.route.params.id)}}, () => {
          this.show = true
        })
        .onDone((error, kuzzleRoom) => {
          if (error) {
            /* TODO: manage subscription error */
            return
          }

          room = kuzzleRoom
        })
    },
    destroyed () {
      if (room) {
        room.unsubscribe()
      }
    }
  }
</script>
