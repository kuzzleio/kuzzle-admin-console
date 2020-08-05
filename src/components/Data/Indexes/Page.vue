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
          <b-col sm="8" class="text-secondary pt-2">
            {{ tableItems.length }}
            {{ tableItems.length === 1 ? 'index' : 'indexes' }}
          </b-col>
        </b-row>
        <div class="m-5">
          <template v-if="tableItems.length === 0">
            <h4 class="text-secondary text-center">
              There is no index.
            </h4>
            <p class="text-secondary text-center">
              You can create one by hitting the button above.
            </p>
          </template>
          <b-card class="light-shadow" bg-variant="default" data-cy="" v-else>
            <b-container fluid class="p-0">
              <b-row no-gutters class="mb-2">
                <b-button
                  variant="outline-dark"
                  class="mr-2"
                  @click="onToggleAllClicked"
                >
                  <i
                    :class="
                      `far ${
                        selectedDocuments.length === tableItems.length
                          ? 'fa-check-square'
                          : 'fa-square'
                      } left`
                    "
                  />
                  Toggle all
                </b-button>

                <b-button
                  variant="outline-danger"
                  class="mr-2"
                  :disabled="!bulkDeleteEnabled"
                  @click="DeleteIndex"
                >
                  <i class="fa fa-minus-circle left" />
                  Delete
                </b-button>
                <b-input-group class="col">
                  <template v-slot:prepend>
                    <b-input-group-text>Filter</b-input-group-text>
                  </template>

                  <auto-focus-input
                    name="collection"
                    v-model="filter"
                  />
                </b-input-group>
              </b-row>
            </b-container>
            <template v-if="filtredIndexes.length === 0">
              <h4 class="text-secondary text-center mt-4 b-5">
                There is no index matching your filter.
              </h4>
            </template>
            <b-list-group class="w-100" v-else>
              <b-list-group-item
                v-for="index in filtredIndexes"
                class="p-2"
                :key="index.indexName"
                :data-cy="'IndexesPage-name--' + index.indexName"
              >
                <data-list-item
                  :data="index"
                  :itemName="index.indexName"
                  :canEdit="true"
                  :canDelete="true"
                  :is-checked="isChecked(index.indexName)"
                  @edit="
                    $router.push({
                      name: 'CreateCollection',
                      params: { index: index.indexName }
                    })
                  "
                  @item-link-click="
                    $router.push({
                      name: 'Collections',
                      params: { index: index.indexName }
                    })
                  "
                  @checkbox-click="toggleSelectDocuments(index.indexName)"
                  @delete="openDeleteModal(index.indexName)"
                />
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </div>
      </template>
    </template>
    <CreateIndexModal :id="createIndexModalId" />
    <DeleteIndexModal :id="deleteIndexModalId" :index="indexToDelete" @modal-close="modalDeleteClose"/>
  </b-container>
</template>

<script>
import Headline from '../../Materialize/Headline'
import CreateIndexModal from './CreateIndexModal'
import DeleteIndexModal from './DeleteIndexModal'
import ListNotAllowed from '../../Common/ListNotAllowed'
import AutoFocusInput from '../../Common/AutoFocusInput'
import { mapGetters } from 'vuex'
import DataListItem from '../DataListItem'

export default {
  name: 'IndexesPage',
  components: {
    Headline,
    CreateIndexModal,
    DeleteIndexModal,
    ListNotAllowed,
    AutoFocusInput,
    DataListItem
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
      ],
      filteredIndexes: [],
      selectedDocuments: []
    }
  },
  computed: {
    ...mapGetters('auth', ['canSearchIndex', 'canCreateIndex']),
    allChecked() {
      if (!this.selectedDocuments || !this.filtredIndexes) {
        return false
      }
      return this.selectedDocuments.length === this.filtredIndexes.length
    },
    bulkDeleteEnabled() {
      return this.selectedDocuments.length > 0
    },
    loading() {
      return this.$store.direct.state.index.loadingIndexes
    },
    indexes() {
      return this.$store.state.index.indexesAndCollections
    },
    filtredIndexes() {
      let filtredIndexes = []
      let re = new RegExp('.*' + this.filter + '.*')
      for (let i = 0; i < this.tableItems.length; i++) {
        if (re.exec(this.tableItems[i].indexName) !== null)
          filtredIndexes.push(this.tableItems[i])
      }
      return filtredIndexes
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
    modalDeleteClose() {
      this.selectedDocuments.shift()
      this.DeleteIndex()
    },
    DeleteIndex() {
      if (this.selectedDocuments.length > 0) {
        this.openDeleteModal(this.selectedDocuments[0])
      }
    },
    toggleSelectDocuments(id) {
      let index = this.selectedDocuments.indexOf(id)

      if (index === -1) {
        this.selectedDocuments.push(id)
        return
      }

      this.selectedDocuments.splice(index, 1)
    },
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    },
    onToggleAllClicked() {
      if (this.allChecked) {
        this.selectedDocuments = []
        return
      }
      this.selectedDocuments = []
      this.selectedDocuments = this.filtredIndexes.map(index => index.indexName)
    },
    openCreateModal() {
      this.$bvModal.show(this.createIndexModalId)
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
