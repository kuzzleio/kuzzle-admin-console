<template>
  <div class="wrapper">
    <headline>
      {{index}}
      <index-dropdown :index="index" class="icon-medium icon-black"></index-dropdown>
    </headline>

    <div class="row">
      <div class="col s12 m10 l8">

        <div class="row actions" v-if="collectionCount">
          <div class="col s9">
            <router-link class="btn waves-effect waves-light primary" v-if="canCreateCollection(index)"
               v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
               :class="{unauthorized: !canCreateCollection(index)}"
               :to="{name: 'DataCreateCollection', params: {index: index}}">
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
                  Here you can view collections in <strong>{{index}}</strong>. <br/>
                  <em>There are currently no collections in this index.</em>
                </p>
                <router-link :to="{name: 'DataCreateCollection', params: {index: index}}"
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
              v-for="collection in orderedFilteredStoredCollections"
              :key="Math.random()"
              :index="index"
              :collection="collection"
              :is-realtime="false">
            </collection-boxed>

            <collection-boxed
                v-for="collection in orderedFilteredRealtimeCollections"
                :key="Math.random()"
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
import IndexDropdown from '../Indexes/Dropdown'
import ListNotAllowed from '../../Common/ListNotAllowed'
import CollectionBoxed from '../Collections/Boxed'
import {
  canSearchIndex,
  canSearchCollection,
  canCreateCollection
} from '../../../services/userAuthorization'
import Title from '../../../directives/title.directive'

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
  data() {
    return {
      filter: ''
    }
  },
  computed: {
    collectionCount() {
      if (!this.$store.state.index.indexesAndCollections[this.index]) {
        return 0
      }

      return (
        this.$store.state.index.indexesAndCollections[this.index].stored
          .length +
        this.$store.state.index.indexesAndCollections[this.index].realtime
          .length
      )
    },
    isCollectionForFilter() {
      if (!this.$store.state.index.indexesAndCollections[this.index]) {
        return
      }

      return (
        this.$store.state.index.indexesAndCollections[this.index].stored.filter(
          col => col.indexOf(this.filter !== -1)
        ).length > 0 ||
        // prettier-ignore
        this.$store.state.index
          .indexesAndCollections[this.index]
          .realtime
          .filter(col => col.indexOf(this.filter !== -1))
          .length > 0
      )
    },
    storedCollections() {
      if (!this.$store.state.index.indexesAndCollections[this.index]) {
        return []
      }

      return this.$store.state.index.indexesAndCollections[this.index].stored
    },
    realtimeCollections() {
      if (!this.$store.state.index.indexesAndCollections[this.index]) {
        return []
      }

      return this.$store.state.index.indexesAndCollections[this.index].realtime
    },
    filteredStoredCollections() {
      return this.storedCollections.filter(
        col => col.indexOf(this.filter) !== -1
      )
    },
    filteredRealtimeCollections() {
      return this.realtimeCollections.filter(
        col => col.indexOf(this.filter) !== -1
      )
    },
    orderedFilteredStoredCollections() {
      return this.filteredStoredCollections.sort()
    },
    orderedFilteredRealtimeCollections() {
      return this.filteredRealtimeCollections.sort()
    }
  }
}
</script>
