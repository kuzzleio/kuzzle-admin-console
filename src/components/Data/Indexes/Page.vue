<template>
  <b-container class="IndexesPage">
    <headline>
      Indexes
      <b-button
        class="float-right mt-3"
        data-cy="IndexesPage-createBtn"
        v-if="canCreateIndex()"
        variant="primary"
        :title="
          !canCreateIndex() ? `Your rights disallow you to create indexes` : ''
        "
        @click.prevent="openCreateModal"
      >
        <i class="fa fa-plus-circle left" />
        Create an index
      </b-button>
    </headline>

    <list-not-allowed v-if="!canSearchIndex()" />
    <template v-else>
      <b-row class="mb-3">
        <b-col sm="8" class="text-secondary pt-2">
          {{ tableItems.length }}
          {{ tableItems.length === 1 ? 'index' : 'indexes' }}
        </b-col>
        <b-col sm="4">
          <b-input-group>
            <template v-slot:prepend>
              <b-input-group-text>Filter</b-input-group-text>
            </template>
            <b-form-input
              v-model="filter"
              :disabled="tableItems.length === 0"
            ></b-form-input>
          </b-input-group>
        </b-col>
      </b-row>

      <b-table
        class="IndexPage-table"
        responsive
        striped
        outlined
        show-empty
        :items="tableItems"
        :fields="tableFields"
        :filter="filter"
      >
        <template v-slot:empty>
          <h4 class="text-secondary text-center">There is no index.</h4>
          <p class="text-secondary text-center" v-if="canCreateIndex()">
            You can create one by hitting the button above.
          </p>
        </template>
        <template v-slot:emptyfiltered>
          <h4 class="text-secondary text-center">
            There is no index matching your filter.
          </h4>
        </template>
        <template v-slot:cell(icon)>
          <i class="fa fa-2x fa-database mr-2"></i>
        </template>
        <template v-slot:cell(indexName)="indexName">
          <router-link
            :data-cy="`IndexesPage-name--${indexName.value}`"
            :title="indexName.value"
            :to="{
              name: 'Collections',
              params: { index: indexName.value }
            }"
          >
            {{ indexName.value }}
          </router-link>
        </template>
        <template v-slot:cell(actions)="row">
          <div class="IndexesPage-actions">
            <b-button
              class="mx-1"
              title="browse this index"
              variant="link"
              :data-cy="`IndexesPage-browse--${row.item.indexName}`"
              :to="{
                name: 'Collections',
                params: { index: row.item.indexName }
              }"
              ><i class="fa fa-eye"></i
            ></b-button>
            <b-button
              class="mx-1"
              title="Create a collection in this index"
              variant="link"
              :data-cy="`IndexesPage-createCollection--${row.item.indexName}`"
              :to="{
                name: 'CreateCollection',
                params: { index: row.item.indexName }
              }"
              @click="openDeleteModal(row.item.indexName)"
              ><i class="fa fa-plus"></i
            ></b-button>
            <b-button
              class="mx-1"
              :data-cy="`IndexesPage-delete--${row.item.indexName}`"
              title="Delete index"
              variant="link"
              @click="openDeleteModal(row.item.indexName)"
              ><i class="fa fa-trash"></i
            ></b-button>
          </div>
        </template>
      </b-table>
    </template>
    <CreateIndexModal :id="createIndexModalId" />
    <DeleteIndexModal :id="deleteIndexModalId" :index="indexToDelete" />
  </b-container>
</template>

<script>
import Headline from '../../Materialize/Headline'
import CreateIndexModal from './CreateIndexModal'
import DeleteIndexModal from './DeleteIndexModal'
import ListNotAllowed from '../../Common/ListNotAllowed'

import Title from '../../../directives/title.directive'
import {
  canCreateIndex,
  canSearchIndex
} from '../../../services/userAuthorization'

export default {
  name: 'IndexesList',
  components: {
    Headline,
    CreateIndexModal,
    DeleteIndexModal,
    ListNotAllowed
  },
  directives: {
    Title
  },
  data() {
    return {
      createIndexModalId: 'createIndexModal',
      deleteIndexModalId: 'deleteIndexModal',
      filter: '',
      indexToDelete: null,
      tableFields: [
        {
          key: 'icon',
          label: '',
          tdClass: 'IndexesPage-icon text-secondary align-middle'
        },
        {
          key: 'indexName',
          label: 'Name',
          sortable: true,
          tdClass: 'IndexesPage-name code align-middle'
        },
        {
          key: 'collectionCount',
          sortable: true,
          label: 'Collections',
          class: 'IndexesPage-collectionCount text-center align-middle'
        },
        {
          key: 'actions',
          label: '',
          class: 'text-right align-middle'
        }
      ]
    }
  },
  computed: {
    indexes() {
      return this.$store.state.index.indexesAndCollections
    },
    tableItems() {
      return Object.keys(this.indexes).map(i => ({
        indexName: i,
        collectionCount:
          this.indexes[i].realtime.length + this.indexes[i].stored.length
      }))
    },
    orderedFilteredIndices() {
      return this.$store.state.index.indexes
        .filter(indexName => indexName.indexOf(this.filter) !== -1)
        .sort()
    }
  },
  methods: {
    canSearchIndex,
    canCreateIndex,
    openCreateModal() {
      this.$bvModal.show(this.createIndexModalId)
    },
    openDeleteModal(index) {
      this.indexToDelete = index
      this.$bvModal.show(this.deleteIndexModalId)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.IndexesPage-icon {
  width: 2em;
}
.IndexesPage-name {
  a {
    color: #222;
    font-weight: 500;
  }
}
.IndexesPage-collectionCount {
  width: 2em;
}
.IndexesPage-actions {
  width: 100%;
}
</style>
