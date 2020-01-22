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
            <b-form-input v-model="filter"></b-form-input>
          </b-input-group>
        </b-col>
      </b-row>

      <!-- Index is empty -->
      <b-card v-if="collectionCount.length === 0">
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

    <!-- No Collection for filter -->
    <b-card
      v-if="!isCollectionForFilter && filter"
      class="card-panel card-body"
    >
      <b-row>
        <b-col sm="3">
          <i class="fa fa-6x fa-search text-secondary" aria-hidden="true" />
        </b-col>
        <b-col>
          <h2>
            There is no collection matching your filter.
          </h2>
        </b-col>
      </b-row>
    </b-card>

    <template v-if="canSearchCollection(index) && isCollectionForFilter">
      <b-table
        striped
        outlined
        sticky-header
        :items="collections"
        :fields="tableFields"
      >
        <template v-slot:cell(type)="type">
          <i
            class="fa fa-2x"
            :class="{
              'fa-bolt': type.value === 'realtime',
              'fa-server': type.value === 'stored'
            }"
            :title="type.value === 'realtime' ? 'Realtime' : 'Persisted'"
          ></i>
        </template>
        <template v-slot:cell(name)="name">
          <b-link
            class="code"
            :to="
              name.item.type === 'realtime'
                ? {
                    name: 'DataCollectionWatch',
                    params: { index, collection: name.value }
                  }
                : {
                    name: 'DataDocumentsList',
                    params: { index, collection: name.value }
                  }
            "
            >{{ name.value }}</b-link
          >
        </template>
        <template v-slot:cell(actions)="row">
          <b-button
            class="mx-1"
            variant="outline-info"
            title="Edit collection"
            :disabled="!canEditCollection(index, row.item.name)"
            :to="
              canEditCollection(index, row.item.name)
                ? {
                    name: 'DataCollectionEdit',
                    params: { collection: row.item.name, index }
                  }
                : ''
            "
            ><i class="fa fa-pencil-alt"></i
          ></b-button>
          <b-button
            class="mx-1"
            variant="outline-secondary"
            title="Delete collection"
            ><i class="fa fa-trash"></i
          ></b-button>
        </template>
      </b-table>
    </template>
  </b-container>
</template>

<style lang="scss" rel="stylesheet/scss">
.CollectionList-type {
  width: 2em;
}
.CollectionList-actions {
  width: 8em;
}
</style>

<script>
import Headline from '../../Materialize/Headline'
import ListNotAllowed from '../../Common/ListNotAllowed'
import {
  canDeleteIndex,
  canSearchIndex,
  canSearchCollection,
  canCreateCollection,
  canEditCollection
} from '../../../services/userAuthorization'
import Title from '../../../directives/title.directive'

export default {
  name: 'CollectionList',
  components: {
    Headline,
    ListNotAllowed
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
    tableFields() {
      return [
        {
          class: 'CollectionList-type align-middle',
          key: 'type',
          label: 'Type'
        },
        {
          key: 'name',
          label: 'Name',
          class: 'align-middle'
        },
        {
          class: 'CollectionList-actions align-middle text-right',
          key: 'actions',
          label: ''
        }
      ]
    },
    collectionCount() {
      return this.storedCollections.length + this.realtimeCollections.length
    },
    isCollectionForFilter() {
      if (!this.$store.state.index.indexesAndCollections[this.index]) {
        return
      }

      return (
        this.orderedFilteredStoredCollections.length > 0 ||
        this.orderedFilteredRealtimeCollections.length > 0
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
    collections() {
      return [
        ...this.orderedFilteredRealtimeCollections.map(c => ({
          name: c,
          type: 'realtime'
        })),
        ...this.orderedFilteredStoredCollections.map(c => ({
          name: c,
          type: 'stored'
        }))
      ].sort((a, b) => (a.name < b.name ? -1 : 1))
    },
    orderedFilteredStoredCollections() {
      return this.storedCollections.filter(
        col => col.indexOf(this.filter) !== -1
      )
    },
    orderedFilteredRealtimeCollections() {
      return this.realtimeCollections.filter(
        col => col.indexOf(this.filter) !== -1
      )
    }
  },
  methods: {
    canDeleteIndex,
    canSearchIndex,
    canSearchCollection,
    canCreateCollection,
    canEditCollection
  }
}
</script>
