<template>
  <div class="wrapper">
    <headline>
      {{index}}
    </headline>


    <!--<div class="row">
      <div class="col s6 m4 l3">

        <div class="row">
          <div class="col s6 truncate">Total documents</div>
          <div class="col s6 right-align">1 567</div>
        </div>
        <div class="row">
          <div class="col s6 truncate">Index Size</div>
          <div class="col s6 right-align">64 mb</div>
        </div>
        <div class="row">
          <div class="col s5 truncate">Auto refresh</div>
          <div class="col s7 right-align">
            <div class="switch">
              <label>
                <input type="checkbox">
                <span class="lever"></span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>-->

    <div class="row">
      <div class="col s12 m10 l8">

        <div class="row actions" v-if="collectionCount">
          <div class="col s9">
            <router-link class="btn waves-effect waves-light primary"
               v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
               :class="{unauthorized: !canCreateCollection(index)}"
               to="{name: canCreateCollection(index) ? {name: 'DataCreateCollection', params: {index: index}} : {}}">
              <i class="fa fa-plus-circle left"></i>Create a collection
            </router-link>
          </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div class="input-field left-align" v-if="collectionCount > 1">
              <label for="filter"><i class="fa fa-search"></i> Filter</label>
              <input id="filter" type="text" tabindex="1" v-model="filter">
            </div>
          </div>
        </div>

        <div class="row list">
          <!-- Not allowed -->
          <list-not-allowed v-if="!canSearchCollection(index)"></list-not-allowed>

          <!-- No Collection -->
          <div class="card-panel" v-if="canSearchCollection(index) && !collectionCount">
            <div class="row valign-bottom empty-set empty-set">
              <div class="col s1 offset-s1">
                <i class="fa fa-6x fa-th-list grey-text text-lighten-1" aria-hidden="true"></i>
              </div>
              <div class="col s9">
                <p>
                  Here, you'll see the collections in <strong>{{index}}</strong>. <br/>
                  <em>There are currently no collection here.</em>
                </p>
                <router-link to="{name: 'DataCreateCollection', params: {index: index}}"
                        v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
                        :class="{unauthorized: !canCreateCollection(index)}"
                        class="btn primary waves-effect waves-light">
                  <i class="fa fa-plus-circle left"></i>
                  Create a collection
                </router-link>
              </div>
            </div>
          </div>

          <!-- Not Collection for filter -->
          <div class="card-panel card-body" v-if="!isCollectionForFilter && filter">
            <div class="row valign-center empty-set">
              <div class="col s2 offset-s1">
                <i class="fa fa-6x fa-search grey-text text-lighten-1" aria-hidden="true"></i>
              </div>
              <div class="col s12">
                <p>
                  There is no collection matching your filter.<br />
                  Please try with another one.
                </p>
              </div>
            </div>
          </div>

          <div v-if="canSearchCollection(index)">
            <collection-boxed
              v-for="collection in orderedFilteredStoredCollections(1)"
              :index="index"
              :collection="collection"
              :is-realtime="false">
            </collection-boxed>

            <collection-boxed
                v-for="collection in orderedFilteredRealtimeCollections(1)"
                :index="index"
                :collection="collection"
                :is-realtime="true">
            </collection-boxed>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .switch {
    label {
      .lever {
        margin: 0;
      }
    }
  }
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .input-field {
    margin-top: 0;
    label {
      left: 0;
    }
    input {
      margin-bottom: 0;
    }
  }
  .list {
    margin-top: 25px;
  }
</style>


<script>
  import Headline from '../../Materialize/Headline'
  import IndexDropdown from './Dropdown'
  import ListNotAllowed from '../../Common/ListNotAllowed'
  import CollectionBoxed from '../Collections/Boxed'
  import {canSearchIndex, canSearchCollection, canCreateCollection} from '../../../services/userAuthorization'
  import Title from '../../../directives/title.directive'
  import _ from 'lodash'

  export default {
    name: 'CollectionsList',
    props: {
      index: String
    },
    components: {
      Headline,
      ListNotAllowed,
      CollectionBoxed,
      IndexDropdown
    },
    methods: {
      canSearchIndex,
      canSearchCollection,
      canCreateCollection
    },
    directives: {
      Title
    },
    data () {
      return {
        filter: ''
      }
    },
    created () {
      console.log('##', this.$store.getters)
    },
    computed: {
      collectionCount () {
        if (!this.$store.getters.indexesAndCollections[this.index]) {
          return 0
        }

        return this.$store.getters.indexesAndCollections[this.index].stored.length +
          this.$store.getters.indexesAndCollections[this.index].realtime.length
      },
      isCollectionForFilter () {
        if (!this.$store.getters.indexesAndCollections[this.index]) {
          return
        }

        return this.$options.filters.filterBy(
            this.$store.getters.indexesAndCollections[this.index].stored,
            this.filter
          ).length > 0 ||
          this.$options.filters.filterBy(
            this.$store.getters.indexesAndCollections[this.index].realtime,
            this.filter
          ).length > 0
      },
      storedCollections () {
        if (!this.$store.getters.indexesAndCollections[this.index]) {
          return []
        }

        return this.$store.getters.indexesAndCollections[this.index].stored
      },
      realtimeCollections () {
        if (!this.$store.getters.indexesAndCollections[this.index]) {
          return []
        }

        return this.$store.getters.indexesAndCollections[this.index].realtime
      },
      filteredStoredCollections () {
        return this.storedCollections.filter(col => col.indexOf(this.filter) !== -1)
      },
      filteredRealtimeCollections () {
        return this.realtimeCollections.filter(col => col.indexOf(this.filter) !== -1)
      },
      orderedFilteredStoredCollections (order) {
        return _.orderBy(this.filteredStoredCollections, order)
      },
      orderedFilteredRealtimeCollections (order) {
        return _.orderBy(this.filteredRealtimeCollections, order)
      }
    }
  }
</script>
