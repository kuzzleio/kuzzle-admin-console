<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <!-- Not allowed -->
    <div class="card-panel" v-if="!canSearchDocument(index, collection)">
      <div class="row valign-bottom empty-set empty-set-condensed">
        <div class="col s1 offset-s1">
          <i class="fa fa-6x fa-lock grey-text text-lighten-1" aria-hidden="true"></i>
        </div>
        <div class="col s10">
          <p>
            You are not allowed to list documents in collection <strong>{{collection}}</strong><br>
          </p>
          <p>
            <em>Learn more about security &amp; permissions on <a href="http://kuzzle.io/guide/#permissions" target="_blank">http://kuzzle.io/guide</a></em>
          </p>
        </div>
      </div>
    </div>

    <common-list
      v-if="canSearchDocument(index, collection)"
      item-name="DocumentItem"
      :collection="collection"
      :index="index"
      @create-clicked="createDocument"
      :display-create="canCreateDocument(index, collection)">

      <div slot="emptySet" class="card-panel">
        <div v-if="isRealtimeCollection" class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i class="fa fa-6x fa-file-text-o grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s8 m9 l10">
            <p>
              There is no persistent document in here because the collection <strong>{{collection}}</strong> is currently realtime-only.<br />
              <em>You can edit the collection and persist it.</em>
            </p>
            <button v-link="{name: 'DataCollectionEdit', params: {index: index, collection: collection}}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-pencil left"></i>
              Edit the collection
            </button>
          </div>
        </div>

        <div v-else class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i class="fa fa-6x fa-file-text-o grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s8 m9 l10">
            <p>
              Here you'll see the documents in <strong>{{collection}}</strong> <br/>
              <em>Currently there is no document in this collection.</em>
            </p>
            <button v-if="canCreateDocument(index, collection)"
                    v-link="{name: 'DataCreateDocument', params: {index: index, collection: collection}}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-plus-circle left"></i>
              Create a document
            </button>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
  import CollectionTabs from '../Collections/Tabs'
  import CommonList from '../../Common/List'
  import Headline from '../../Materialize/Headline'
  import CollectionDropdown from '../Collections/Dropdown'
  import { listIndexesAndCollections } from '../../../vuex/modules/data/actions'
  import { canSearchIndex, canSearchDocument, canCreateDocument, canDeleteDocument, canEditDocument } from '../../../services/userAuthorization'
  import { indexesAndCollections } from '../../../vuex/modules/data/getters'

  export default {
    name: 'DocumentsList',
    props: {
      index: String,
      collection: String
    },
    components: {
      CollectionTabs,
      CommonList,
      Headline,
      CollectionDropdown
    },
    vuex: {
      actions: {
        listIndexesAndCollections
      },
      getters: {
        indexesAndCollections
      }
    },
    computed: {
      isRealtimeCollection () {
        if (!this.indexesAndCollections[this.index]) {
          return false
        }
        if (!this.indexesAndCollections[this.index].realtime) {
          return false
        }
        return this.indexesAndCollections[this.index].realtime.indexOf(this.collection) !== -1
      }
    },
    methods: {
      createDocument () {
        this.$router.go({name: 'DataCreateDocument'})
      },
      canSearchIndex,
      canSearchDocument,
      canCreateDocument,
      canDeleteDocument,
      canEditDocument
    },
    route: {
      data () {
        // let Vue change props before broadcast the event
        setTimeout(() => {
          this.$broadcast('crudl-refresh-search')
        }, 0)
      }
    },
    ready () {
      if (this.canSearchIndex()) {
        this.listIndexesAndCollections()
      }
    }
  }
</script>
