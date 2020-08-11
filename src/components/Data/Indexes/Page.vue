<template>
  <b-container class="IndexesPage" ref="page-indexes">
    <headline>
      Indexes
      <b-button
        class="float-right mt-3"
        data-cy="IndexesPage-createBtn"
        v-if="canCreateIndex"
        variant="primary"
        :title="
          !canCreateIndex ? `Your rights disallow you to create indexes` : ''
        "
        @click.prevent="openCreateModal"
      >
        <i class="fa fa-plus-circle left" />
        Create an index
      </b-button>
    </headline>

    <list-not-allowed v-if="!canSearchIndex" />
    <template v-else>
      <template v-if="loading"></template>
      <template v-else>
        <b-row class="mb-3">
          <b-col sm="6" class="text-secondary pt-2">
            {{ tableItems.length }}
            {{ tableItems.length === 1 ? 'index' : 'indexes' }}
          </b-col>
          <b-col sm="6">
            <b-row>
              <b-col cols="6" class="text-right">
                <b-button
                  variant="outline-dark"
                  class="mr-2"
                  @click="onToggleAllClicked"
                >
                  <i
                    :class="
                      `far ${
                        selectedIndexes.length === filteredIndexes.length
                          ? 'fa-check-square'
                          : 'fa-square'
                      } left`
                    "
                  />
                  Toggle all
                </b-button>

                <b-button
                  variant="outline-danger"
                  :disabled="!bulkDeleteEnabled"
                  @click="DeleteIndexes"
                >
                  <i class="fa fa-minus-circle left" />
                  Delete
                </b-button>
              </b-col>
              <b-col cols="6">
                <b-input-group>
                  <template v-slot:prepend>
                    <b-input-group-text>Filter</b-input-group-text>
                  </template>

                  <auto-focus-input
                    name="index"
                    v-model="filter"
                    :disabled="tableItems.length === 0"
                    @submit="navigateToIndex"
                  />
                </b-input-group>
              </b-col>
            </b-row>
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
          @filtered="updateFilteredIndexes"
        >
          <template v-slot:empty>
            <h4 class="text-secondary text-center">There is no index.</h4>
            <p class="text-secondary text-center" v-if="canCreateIndex">
              You can create one by hitting the button above.
            </p>
          </template>
          <template v-slot:emptyfiltered>
            <h4 class="text-secondary text-center">
              There is no index matching your filter.
            </h4>
          </template>
          <template v-slot:cell(selected)="row">
            <b-form-checkbox
              class="d-inline-block align-middle"
              type="checkbox"
              unchecked-value="false"
              value="true"
              :checked="isChecked(row.item.indexName)"
              @change="onCheckboxClick(row.item.indexName)"
            />
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
    </template>
    <CreateIndexModal :id="createIndexModalId" />
    <DeleteIndexModal
      :id="deleteIndexModalId"
      :index="indexToDelete"
      @modal-close="onModalClose"
    />
  </b-container>
</template>

<script>
import Headline from '../../Materialize/Headline'
import CreateIndexModal from './CreateIndexModal'
import DeleteIndexModal from './DeleteIndexModal'
import ListNotAllowed from '../../Common/ListNotAllowed'
import AutoFocusInput from '../../Common/AutoFocusInput'
import { mapGetters } from 'vuex'

export default {
  name: 'IndexesPage',
  components: {
    Headline,
    CreateIndexModal,
    DeleteIndexModal,
    ListNotAllowed,
    AutoFocusInput
  },
  data() {
    return {
      createIndexModalId: 'createIndexModal',
      deleteIndexModalId: 'deleteIndexModal',
      filter: '',
      indexToDelete: null,
      tableFields: [
        {
          class: 'CollectionList-type align-middle',
          key: 'selected',
          label: ''
        },
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
      ],
      filteredIndexes: [],
      selectedIndexes: []
    }
  },
  mounted() {
    this.updateFilteredIndexes(this.tableItems)
  },
  computed: {
    ...mapGetters('auth', ['canSearchIndex', 'canCreateIndex']),
    loading() {
      return this.$store.direct.state.index.loadingIndexes
    },
    bulkDeleteEnabled() {
      return this.selectedIndexes.length > 0
    },
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
    openCreateModal() {
      this.$bvModal.show(this.createIndexModalId)
    },
    onModalClose() {
      this.selectedIndexes.shift()
      this.DeleteIndexes()
    },
    DeleteIndexes() {
      if (this.selectedIndexes.length > 0) {
        this.openDeleteModal(this.selectedIndexes[0])
      }
    },
    allChecked() {
      if (!this.selectedIndexes || !this.filteredIndexes) {
        return false
      }
      return this.selectedIndexes.length === this.filteredIndexes.length
    },
    onToggleAllClicked() {
      if (this.allChecked()) {
        this.selectedIndexes = []
        return
      }
      this.selectedIndexes = []
      this.selectedIndexes = this.filteredIndexes.map(index => index.indexName)
    },
    isChecked(name) {
      return this.selectedIndexes.indexOf(name) > -1
    },
    onCheckboxClick(name) {
      let index = this.selectedIndexes.indexOf(name)
      if (index === -1) {
        this.selectedIndexes.push(name)
        return
      }
      this.selectedIndexes.splice(index, 1)
    },
    openDeleteModal(index) {
      this.indexToDelete = index
      this.$bvModal.show(this.deleteIndexModalId)
    },
    navigateToIndex() {
      const index = this.filteredIndexes[0]

      if (!index) {
        return
      }

      const route = {
        name: 'Collections',
        params: { index: index.indexName }
      }

      this.$router.push(route)
    },
    updateFilteredIndexes(filteredIndexes) {
      this.filteredIndexes = filteredIndexes
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
