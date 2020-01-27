<template>
  <div class="IndexesPage wrapper w-75">
    <headline>
      Indexes - Browse
      <b-button
        class="float-right mt-3"
        v-if="canCreateIndex() && $store.state.index.indexes.length"
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

    <template v-if="canSearchIndex() && !$store.state.index.indexes.length">
      <b-card>
        <b-card-text>
          <b-container>
            <b-row align-v="center">
              <b-col lg="3" xl="2" class="d-none d-xl-block mr-1">
                <i
                  class="fa fa-8x fa-database text-secondary"
                  aria-hidden="true"
                />
              </b-col>
              <b-col>
                <h2>Here you'll see the kuzzle's indexes</h2>
                <p><em>Currently there is no index.</em></p>
                <b-button
                  v-if="canCreateIndex()"
                  variant="primary"
                  @click.prevent="openCreateModal"
                >
                  <i class="fa fa-plus-circle left" />
                  Create an index
                </b-button>
              </b-col>
            </b-row>
          </b-container>
        </b-card-text>
      </b-card>
    </template>
    <template v-if="$store.state.index.indexes.length">
      <b-table
        striped
        outlined
        sticky-header="1000px"
        :items="tableItems"
        :fields="tableFields"
      >
        <template v-slot:cell(indexName)="indexName">
          <i class="fa fa-2x fa-database mr-2"></i>
          {{ indexName.value }}
        </template>
        <template v-slot:cell(actions)="row">
          <b-button
            class="mx-1"
            variant="outline-secondary"
            title="Delete index"
            @click="openDeleteModal(row.item.indexName)"
            ><i class="fa fa-trash"></i
          ></b-button>
        </template>
      </b-table>
    </template>
    <CreateIndexModal :id="createIndexModalId" />
    <DeleteIndexModal :id="deleteIndexModalId" :index="indexToDelete" />
  </div>
</template>

<script>
import Headline from '../../Materialize/Headline'
import CreateIndexModal from './CreateIndexModal'
import DeleteIndexModal from './DeleteIndexModal'
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
    DeleteIndexModal
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
        { key: 'indexName', sortable: true },
        {
          key: 'collectionsNumber',
          sortable: true,
          label: 'Number of collections'
        },
        { key: 'actions', label: '' }
      ]
    }
  },
  computed: {
    tableItems() {
      const tableItems = [],
        entries = Object.entries(this.$store.state.index.indexesAndCollections)

      for (const [index, collections] of entries) {
        tableItems.push({
          indexName: index,
          collectionsNumber:
            collections.realtime.length + collections.stored.length
        })
      }
      return tableItems
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

<style lang="scss" rel="stylesheet/scss" scoped>
.wrapper {
  margin: 0 auto;
}
</style>
