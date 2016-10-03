<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <list-not-allowed v-if="!canSearchDocument(index, collection)"></list-not-allowed>

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
            <button :disabled="!canEditCollection(index, collection)"
                    title="{{!canEditCollection(index, collection) ? 'You are not allowed to edit this collection' : ''}}"
                    :class="!canEditCollection(index, collection) ? 'disabled' : ''"
                    v-link="{name: 'DataCollectionEdit', params: {index: index, collection: collection}}"
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
            <button :disabled="!canCreateDocument(index, collection)"
                    v-link="{name: 'DataCreateDocument', params: {index: index, collection: collection}}"
                    class="btn primary waves-effect waves-light"
                    :class="!canCreateDocument(index, collection) ? 'disabled' : ''"
                    title="{{!canCreateDocument(index, collection) ? 'You are not allowed to create documents in this collection' : ''}}">
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
  import ListNotAllowed from '../../Common/ListNotAllowed'
  import Headline from '../../Materialize/Headline'
  import CollectionDropdown from '../Collections/Dropdown'
  import {
    canSearchIndex,
    canSearchDocument,
    canCreateDocument,
    canDeleteDocument,
    canEditDocument,
    canEditCollection
  } from '../../../services/userAuthorization'
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
      ListNotAllowed,
      Headline,
      CollectionDropdown
    },
    vuex: {
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
      canEditDocument,
      canEditCollection
    },
    route: {
      data () {
        // let Vue change props before broadcast the event
        setTimeout(() => {
          this.$broadcast('crudl-refresh-search')
        }, 0)
      }
    }
  }
</script>
