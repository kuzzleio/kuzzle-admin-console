<template>
  <data-not-found v-if="!index" class="mt-3"></data-not-found>
  <b-container class="CollectionList" v-else>
    <headline>
      <b-row>
        <b-col sm="9" class="text-truncate">
          <i class="fa fa-database text-secondary"></i> &nbsp;
          <span class="code">{{ indexName }}</span>
        </b-col>
        <b-col class="text-right">
          <b-button
            class="align-middle"
            data-cy="CollectionList-create"
            variant="primary"
            :disabled="!canCreateCollection(indexName) || !index"
            :title="
              !canCreateCollection(indexName)
                ? `Your rights disallow you to create collections on index ${indexName}`
                : ''
            "
            :to="{ name: 'CreateCollection', params: { indexName } }"
          >
            <i class="fa fa-plus"></i> Create a collection
          </b-button>
        </b-col>
      </b-row>
    </headline>

    <list-not-allowed v-if="!canSearchCollection(indexName)" />
    <div class="CollectionList-content" v-else>
      <template v-if="loading">
        <main-spinner />
      </template>
      <template v-else>
        <b-row class="mb-3">
          <b-col sm="2" class="text-secondary">
            {{ collections.length }}
            {{ collections.length === 1 ? 'collection' : 'collections' }}
          </b-col>
          <b-col sm="10">
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
                        selectedCollections.length ===
                        filteredCollections.length
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
                  v-if="
                    $store.direct.getters.kuzzle.currentEnvironment
                      .backendMajorVersion !== 1
                  "
                  @click="deleteCollections"
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
                    name="collection"
                    v-model="filter"
                    @submit="navigateToCollection"
                    :disabled="collections.length === 0"
                  />
                </b-input-group>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-table
          striped
          outlined
          show-empty
          data-cy="CollectionList-table"
          :items="collections"
          :fields="tableFields"
          :filter="filter"
          @filtered="updateFilteredCollections"
        >
          <template v-slot:empty>
            <h4 class="text-secondary text-center">
              This index has no collections.
            </h4>
            <p
              v-if="canCreateCollection(index.name)"
              class="text-secondary text-center"
            >
              You can create the collection by hitting the button above.
            </p>
          </template>
          <template v-slot:emptyfiltered>
            <h4 class="text-secondary text-center">
              There is no collection matching your filter.
            </h4>
          </template>
          <template v-slot:cell(selected)="row">
            <b-form-checkbox
              class="d-inline-block align-middle"
              type="checkbox"
              unchecked-value="false"
              value="true"
              :checked="isChecked(row.item)"
              @change="onCheckboxClick(row.item)"
            />
          </template>
          <template v-slot:cell(type)="row">
            <i
              class="fa fa-2x"
              :class="{
                'fa-bolt ml-2': row.item.type === 'realtime',
                'fa-th-list': row.item.type === 'stored'
              }"
              :title="row.item.type === 'realtime' ? 'Realtime' : 'Stored'"
            ></i>
          </template>
          <template v-slot:cell(name)="row">
            <b-link
              class="code"
              :data-cy="`CollectionList-name--${row.item.name}`"
              :title="row.item.name"
              :to="
                row.item.type === 'realtime'
                  ? {
                      name: 'WatchCollection',
                      params: {
                        indexName: indexName,
                        collectionName: row.item.name
                      }
                    }
                  : {
                      name: 'DocumentList',
                      params: {
                        indexName: indexName,
                        collectionName: row.item.name
                      }
                    }
              "
              >{{ truncateName(row.item.name) }}</b-link
            >
          </template>
          <template v-slot:cell(count)="row">
            {{ row.item.count }}
          </template>
          <template v-slot:cell(actions)="row">
            <b-button
              class="mx-1"
              variant="link"
              title="Browse contents"
              :to="
                row.item.type === 'realtime'
                  ? {
                      name: 'WatchCollection',
                      params: {
                        indexName: indexName,
                        collectionName: row.item.name
                      }
                    }
                  : {
                      name: 'DocumentList',
                      params: {
                        indexName: indexName,
                        collectionName: row.item.name
                      }
                    }
              "
              ><i class="fa fa-eye"></i
            ></b-button>
            <b-button
              class="mx-1"
              variant="link"
              title="Edit collection"
              :data-cy="`CollectionList-edit--${row.item.name}`"
              :disabled="
                row.item.type !== 'stored' || !canEditCollection(row.item.name)
              "
              :to="
                canEditCollection(row.item.name)
                  ? {
                      name: 'EditCollection',
                      params: {
                        indexName: indexName,
                        collectionName: row.item.name
                      }
                    }
                  : ''
              "
              ><i class="fa fa-pencil-alt"></i
            ></b-button>
            <b-button
              class="mx-1"
              variant="link"
              v-if="
                currentEnvironment.backendMajorVersion !== 1 ||
                  row.item.type === 'realtime'
              "
              title="Delete collection"
              :data-cy="`CollectionList-delete--${row.item.name}`"
              @click="onDeleteCollectionClicked(row.item)"
              ><i class="fa fa-trash"></i
            ></b-button>
          </template>
        </b-table>
      </template>
    </div>
    <DeleteCollectionModal
      :index="index"
      :collection="collectionToDelete"
      :modalId="deleteCollectionModalId"
      @delete-successful="onDeleteModalSuccess"
    />
    <BulkDeleteCollectionsModal
      :index="index"
      :collections="selectedCollections"
      :modalId="bulkDeleteCollectionsModalId"
      @delete-successful="onDeleteModalSuccess"
    />
  </b-container>
</template>

<script>
import DataNotFound from '../Data404'
import DeleteCollectionModal from './DeleteCollectionModal'
import BulkDeleteCollectionsModal from './BulkDeleteCollectionsModal'
import Headline from '../../Materialize/Headline'
import ListNotAllowed from '../../Common/ListNotAllowed'
import MainSpinner from '../../Common/MainSpinner'
import AutoFocusInput from '../../Common/AutoFocusInput'
import { truncateName } from '../../../utils'
import { mapGetters } from 'vuex'

export default {
  name: 'CollectionList',
  components: {
    DataNotFound,
    DeleteCollectionModal,
    BulkDeleteCollectionsModal,
    Headline,
    ListNotAllowed,
    MainSpinner,
    AutoFocusInput
  },
  props: {
    indexName: String
  },
  data() {
    return {
      deleteCollectionModalId: 'deleteCollectionModal',
      bulkDeleteCollectionsModalId: 'bulkDeleteCollectionsModal',
      filter: '',
      collectionToDelete: null,
      deleteConfirmation: '',
      rawStoredCollections: [],
      filteredCollections: [],
      modalDeleteId: 'modal-collection-delete',
      rawStoredCollections: [],
      selectedCollections: []
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle', 'currentEnvironment']),
    ...mapGetters('auth', [
      'canSearchCollection',
      'canCreateCollection',
      'canEditCollection'
    ]),
    loading() {
      return this.$store.direct.getters.index.loadingCollections(this.indexName)
    },
    index() {
      return this.$store.direct.getters.index.getOneIndex(this.indexName)
    },
    collections() {
      return this.index ? this.index.collections : []
    },
    bulkDeleteEnabled() {
      return this.selectedCollections.length > 0
    },
    allChecked() {
      if (!this.selectedCollections || !this.filteredCollections) {
        return false
      }
      return this.selectedCollections.length === this.filteredCollections.length
    },
    tableFields() {
      return [
        {
          class: 'CollectionList-type align-middle',
          key: 'selected',
          label: ''
        },
        {
          class: 'CollectionList-type align-middle',
          key: 'type',
          label: ''
        },
        {
          key: 'name',
          label: 'Name',
          sortable: true,
          class: 'CollectionList-name align-middle'
        },
        {
          class: 'CollectionList-actions align-middle text-right',
          key: 'actions',
          label: ''
        }
      ]
    }
  },
  methods: {
    truncateName,
    onDeleteCollectionClicked(collection) {
      this.collectionToDelete = collection
      this.$bvModal.show(this.deleteCollectionModalId)
    },
    deleteCollections() {
      this.$bvModal.show(this.bulkDeleteCollectionsModalId)
    },
    onToggleAllClicked() {
      if (this.allChecked) {
        this.selectedCollections = []
        return
      }

      this.selectedCollections = []
      this.selectedCollections = this.filteredCollections
    },
    isChecked(collection) {
      return this.selectedCollections.find(el => el.name === collection.name)
        ? true
        : false
    },
    onCheckboxClick(collection) {
      const collectionAlreadySelected = this.selectedCollections.find(
        el => el.name === collection.name
      )

      if (!collectionAlreadySelected) {
        this.selectedCollections.push(collection)
        return
      }

      this.selectedCollections = this.selectedCollections.filter(
        el => el.name !== collection.name
      )
    },
    async onDeleteModalSuccess() {
      await this.fetchCollections()
      this.updateFilteredCollections(this.collections)
    },
    async fetchCollections() {
      if (!this.index) {
        return
      }

      try {
        await this.$store.direct.dispatch.index.fetchCollections(this.index)
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while counting documents in collections.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    },
    navigateToCollection() {
      const collection = this.filteredCollections[0]

      if (!collection) {
        return
      }

      const route = {
        name:
          collection.type === 'realtime' ? 'WatchCollection' : 'DocumentList',
        params: { index: this.index, collection: collection.name }
      }

      this.$router.push(route)
    },
    updateFilteredCollections(filteredCollections) {
      this.filteredCollections = filteredCollections
    }
  },
  async created() {
    await this.fetchCollections()
    this.updateFilteredCollections(this.collections)
  },
  watch: {
    index: {
      async handler() {
        await this.fetchCollections()
        this.updateFilteredCollections(this.collections)
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.CollectionList-type {
  width: 2em;
  color: #555;
}
.CollectionList-actions {
  width: 30%;
}
.CollectionList-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  a {
    color: #222;
    font-weight: 500;
  }
}
</style>
