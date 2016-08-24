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
              There are no presisted documents in here because the collection <strong>{{collection}}</strong> is currently realtime-only.<br />
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
              You will see <strong>{{collection}}'s</strong> documents here<br/>
              <em>For the time there is no one created yet</em>
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
  import { collections } from '../../../vuex/modules/data/getters'
  import { getCollectionsFromIndex } from '../../../vuex/modules/data/actions'
  import { canSearchCollection } from '../../../services/userAuthorization'

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
      getters: {
        collections
      },
      actions: {
        getCollectionsFromIndex
      }
    },
    computed: {
      isRealtimeCollection () {
        return this.collections.realtime.indexOf(this.collection) !== -1
      }
    },
    methods: {
      createDocument () {
        this.$router.go({name: 'DataCreateDocument'})
      },
      canSearchCollection
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
      if (this.canSearchCollection(this.index)) {
        this.getCollectionsFromIndex(this.index)
      }
    }
  }
</script>
