<template>
  <b-container class="CollectionList">
    <headline>
      <i class="fa fa-database text-secondary"></i> &nbsp;
      <span class="code">{{ index }}</span>
      <b-button
        class="float-right"
        variant="primary"
        :disabled="!canCreateCollection(index)"
        :title="
          !canCreateCollection(index)
            ? `Your rights disallow you to create collections on index ${index}`
            : ''
        "
        :to="{ name: 'DataCreateCollection', params: { index: index } }"
      >
        <i class="fa fa-plus"></i> Create a collection
      </b-button>
    </headline>

    <list-not-allowed v-if="!canSearchCollection(index)" />
    <template v-else>
      <b-row class="mb-3">
        <b-col sm="8" class="text-secondary">
          {{ collectionCount }}
          {{ collectionCount === 1 ? 'collection' : 'collections' }}
        </b-col>
        <b-col sm="4">
          <b-input-group>
            <template v-slot:prepend>
              <b-input-group-text>Filter</b-input-group-text>
            </template>
            <b-form-input></b-form-input>
          </b-input-group>
        </b-col>
      </b-row>

      <!-- Index is empty -->
      <b-card v-if="true">
        <b-row>
          <b-col sm="3">
            <i class="fa fa-6x fa-th-list text-secondary" aria-hidden="true" />
          </b-col>
          <b-col>
            <h1>The current index is empty</h1>
            <p>You can create the collection by hitting the button above.</p>
          </b-col>
        </b-row>
      </b-card>
    </template>

    <!-- Not Collection for filter -->
    <div v-if="!isCollectionForFilter && filter" class="card-panel card-body">
      <div class="row valign-center empty-set">
        <div class="col s2 offset-s1">
          <i
            class="fa fa-6x fa-search grey-text text-lighten-1"
            aria-hidden="true"
          />
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
        v-for="(collection, i) in orderedFilteredStoredCollections"
        :key="collection + i"
        :index="index"
        :collection="collection"
        :is-realtime="false"
      />

      <collection-boxed
        v-for="(collection, i) in orderedFilteredRealtimeCollections"
        :key="collection + i"
        :index="index"
        :collection="collection"
        :is-realtime="true"
      />
    </div>
  </b-container>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
// .switch {
//   label {
//     .lever {
//       margin: 0;
//     }
//   }
// }
// .actions {
//   display: flex;
//   justify-content: space-between;
//   align-items: flex-end;
// }
// .input-field {
//   margin-top: 0;
//   label {
//     left: 0;
//   }
//   input {
//     margin-bottom: 0;
//   }
// }
// .list {
//   margin-top: 25px;
// }
</style>

<script>
import Headline from '../../Materialize/Headline'
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
  name: 'CollectionList',
  components: {
    Headline,
    ListNotAllowed,
    CollectionBoxed
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
        this.$store.state.index.indexesAndCollections[
          this.index
        ].stored.filter(col => col.indexOf(this.filter !== -1)).length > 0 ||
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
    orderedFilteredStoredCollections() {
      return this.storedCollections
        .filter(col => col.indexOf(this.filter) !== -1)
        .sort()
    },
    orderedFilteredRealtimeCollections() {
      return this.realtimeCollections
        .filter(col => col.indexOf(this.filter) !== -1)
        .sort()
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
