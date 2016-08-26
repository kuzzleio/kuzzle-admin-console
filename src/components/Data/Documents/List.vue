<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <common-list
      item-name="DocumentItem"
      :collection="collection"
      :index="index"
      @create-clicked="createDocument">

      <div slot="emptySet" class="card-panel">
        <div v-if="isRealtimeCollection" class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i class="fa fa-6x fa-file-text-o grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s10">
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
          <div class="col s10">
            <p>
              Here you'll see the documents in <strong>{{collection}}</strong> <br/>
              <em>Currently there is no document in this collection.</em>
            </p>
            <button v-link="{name: 'DataCreateDocument', params: {index: index, collection: collection}}"
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
  import { canSearchIndex } from '../../../services/userAuthorization'
  import { getCollectionsFromTree } from '../../../services/data'
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
        if (!this.collections) {
          return false
        }
        if (!this.collections.realtime) {
          return false
        }
        return this.collections.realtime.indexOf(this.collection) !== -1
      },
      collections () {
        return getCollectionsFromTree(this.indexesAndCollections, this.index)
      }
    },
    methods: {
      createDocument () {
        this.$router.go({name: 'DataCreateDocument'})
      },
      canSearchIndex
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
