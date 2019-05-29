<template>
  <div class="CollectionsList wrapper">
    <headline>
      {{ index }}
      <index-dropdown 
        :index="index"
        class="icon-medium icon-black"
      />
    </headline>

    <div class="row">
      <div class="col s12 m10 l8">
        <div
          v-if="collectionCount"
          class="row actions"
        >
          <div class="col s9">
            <router-link
              v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
              class="CollectionsList-createBtn btn waves-effect waves-light primary"
              :class="{unauthorized: !canCreateCollection(index)}"
              :to="canCreateCollection(index) ? {name: 'DataCreateCollection', params: {index: index}} : ''"
            >
              <i class="fa fa-plus-circle left" />Create a collection
            </router-link>
          </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div
              v-if="collectionCount > 1"
              class="input-field left-align"
            >
              <label for="filter"><i class="fa fa-search" /> Filter</label>
              <input
                id="filter"
                v-model="filter"
                type="text"
                tabindex="1"
              >
            </div>
          </div>
        </div>

        <div class="row list">
          <!-- Not allowed -->
          <list-not-allowed v-if="!canSearchCollection(index)" />

          <!-- No Collection -->
          <div
            v-if="canSearchCollection(index) && !collectionCount"
            class="card-panel"
          >
            <div class="row valign-bottom empty-set empty-set">
              <div class="col s1 offset-s1">
                <i
                  class="fa fa-6x fa-th-list grey-text text-lighten-1"
                  aria-hidden="true"
                />
              </div>
              <div class="col s9">
                <p>
                  Here you can view collections in <strong>{{ index }}</strong>. <br>
                  <em>There are currently no collections in this index.</em>
                </p>
                <router-link
                  v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
                  :to="{name: 'DataCreateCollection', params: {index: index}}"
                  :class="{unauthorized: !canCreateCollection(index)}"
                  class="btn primary waves-effect waves-light"
                >
                  <i class="fa fa-plus-circle left" />
                  Create a collection
                </router-link>
              </div>
            </div>
          </div>

          <!-- Not Collection for filter -->
          <div
            v-if="!isCollectionForFilter && filter"
            class="card-panel card-body"
          >
            <div class="row valign-center empty-set">
              <div class="col s2 offset-s1">
                <i
                  class="fa fa-6x fa-search grey-text text-lighten-1"
                  aria-hidden="true"
                />
              </div>
              <div class="col s12">
                <p>
                  There is no collection matching your filter.<br>
                  Please try with another one.
                </p>
              </div>
            </div>
          </div>

          <div v-if="canSearchCollection(index)">
            <collection-boxed
              v-for="(collection, i) in orderedFilteredStoredCollections"
              :key="i"
              :index="index"
              :collection="collection"
              :is-realtime="false"
            />

            <collection-boxed
              v-for="(collection, i) in orderedFilteredRealtimeCollections"
              :key="i"
              :index="index"
              :collection="collection"
              :is-realtime="true"
            />
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
  canDeleteIndex,
  canSearchIndex,
  canSearchCollection,
  canCreateCollection
} from '../../../services/userAuthorization'
import Title from '../../../directives/title.directive'

export default {
  name: 'CollectionsList',
  components: {
    Headline,
    ListNotAllowed,
    CollectionBoxed,
    IndexDropdown
  },
  directives: {
    Title
  },
  props: {
    index: String
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
  },
  methods: {
    canDeleteIndex,
    canSearchIndex,
    canSearchCollection,
    canCreateCollection
  }
}
</script>
