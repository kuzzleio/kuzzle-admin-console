<template>
  <b-container class="CollectionList">
    <headline>
      <b-row>
        <b-col sm="9" class="text-truncate">
          <i class="fa fa-database text-secondary"></i> &nbsp;
          <span class="code">{{ index }}</span>
        </b-col>
        <b-col class="text-right">
          <b-button
            class="align-middle"
            data-cy=""
            variant="primary"
            :disabled="!canCreateCollection(index) || !indexExists"
            :title="
              !canCreateCollection(index)
                ? `Your rights disallow you to create collections on index ${index}`
                : ''
            "
            :to="{ name: 'CreateCollection', params: { index: index } }"
          >
            <i class="fa fa-plus"></i> Create a collection
          </b-button>
        </b-col>
      </b-row>
    </headline>

    <list-not-allowed v-if="!canSearchCollection(index)" />
    <div class="CollectionList-content" v-else>
      <template v-if="loading">
        <main-spinner />
      </template>
      <template v-else>
        <b-row class="mb-3">
          <b-col sm="8" class="text-secondary">
            {{ collections.length }}
            {{ collections.length === 1 ? 'collection' : 'collections' }}
          </b-col>
        </b-row>
        <data-not-found v-if="!indexExists" class="mt-3"></data-not-found>
        <div v-else class="m-5">
          <template v-if="collections.length === 0">
            <h4 class="text-secondary text-center">
              This index has no collections.
            </h4>
            <p class="text-secondary text-center">
              You can create the collection by hitting the button above.
            </p>
          </template>
          <b-card class="light-shadow" bg-variant="default" v-else>
            <b-row no-gutters class="mb-2">
              <b-input-group class="mb-2">
                <template v-slot:prepend>
                  <b-input-group-text>Filter</b-input-group-text>
                </template>

                <auto-focus-input
                  name="collection"
                  v-model="filter"
                  @submit="navigateToCollection"
                />
              </b-input-group>
              <b-row no-gutters class="mb-2">
                <b-button
                  variant="outline-dark"
                  class="mr-2"
                  @click="onToggleAllClicked"
                >
                  <i
                    :class="
                      `far ${
                        selectedDocuments.length === collections.length
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
                  @click="DeleteCollections"
                >
                  <i class="fa fa-minus-circle left" />
                  Delete
                </b-button>
              </b-row>
              <b-list-group class="w-100">
                <b-list-group-item
                  v-for="collection in filtredCollections"
                  class="p-2"
                  :key="collection.id"
                >
                  <document-list-item
                    :document="collection"
                    :itemName="collection.name"
                    :canEdit="
                      collection.type === 'stored' ||
                        canEditCollection(index, collection.name)
                    "
                    :canDelete="canDelete"
                    :is-checked="isChecked(collection.name)"
                    @edit="
                      canEditCollection(index, collection.name)
                        ? $router.push({
                            name: 'EditCollection',
                            params: { collection: collection.name, index: index }
                          })
                        : ''
                    "
                    @item-link-click="
                      $router.push({
                        name: 'DocumentList',
                        params: { index, collection: collection.name }
                      })
                    "
                    @checkbox-click="toggleSelectDocuments(collection.name)"
                    @delete="onDeleteCollectionClicked(collection.name)"
                  />
                </b-list-group-item>
              </b-list-group>
            </b-row>
          </b-card>
        </div>
      </template>
    </div>

    <b-modal
      size="lg"
      id="deleteCollectionPrompt"
      title="Are you sure you want to delete this collection?"
      @hidden="resetDeletePrompt"
    >
      <b-form-group
        description="This operation is NOT reversible"
        label-for="deleteCollectionPromptField"
        :state="deletionConfirmed"
        :invalid-feedback="deletionPromptFeedback"
      >
        <template v-slot:label>
          Please type the name of the collection (<span class="code">{{
            collectionToDelete
          }}</span
          >) below to confirm the deletion:
        </template>
        <b-form-input
          id="deleteCollectionPromptField"
          data-cy=""
          v-model="deleteConfirmation"
          @keypress.enter="onDeleteCollectionConfirmed"
        ></b-form-input>
      </b-form-group>
      <template v-slot:modal-footer>
        <b-button @click="$bvModal.hide('deleteCollectionPrompt')"
          >Cancel</b-button
        >
        <b-button
          data-cy="DeleteCollectionPrompt-OK"
          variant="danger"
          :disabled="!deleteConfirmation"
          @click="onDeleteCollectionConfirmed"
          >OK</b-button
        >
      </template>
    </b-modal>
  </b-container>
</template>

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

<script>
import DataNotFound from '../Data404'
import Headline from '../../Materialize/Headline'
import ListNotAllowed from '../../Common/ListNotAllowed'
import MainSpinner from '../../Common/MainSpinner'
import AutoFocusInput from '../../Common/AutoFocusInput'
import { truncateName } from '../../../utils'
import { mapGetters } from 'vuex'
import DocumentListItem from '../Documents/DocumentListItem'
export default {
  name: 'CollectionList',
  components: {
    DataNotFound,
    Headline,
    ListNotAllowed,
    MainSpinner,
    AutoFocusInput,
    DocumentListItem
  },
  props: {
    index: String
  },
  data() {
    return {
      filter: '',
      collectionToDelete: '',
      deleteConfirmation: '',
      rawStoredCollections: [],
      filteredCollections: [],
      selectedDocuments: []
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle']),
    ...mapGetters('auth', [
      'canSearchCollection',
      'canCreateCollection',
      'canEditCollection',
      'canDeleteDocument'
    ]),
    filtredCollections() {
      let filtredCollections = []
      let re = new RegExp('.*' + this.filter + '.*')
      for (let i = 0; i < this.collections.length; i++) {
        if (re.exec(this.collections[i].name) !== null)
          filtredCollections.push(this.collections[i])
      }
      return filtredCollections
    },
    bulkDeleteEnabled() {
      return this.selectedDocuments.length > 0
    },
    allChecked() {
      if (!this.selectedDocuments || !this.collections) {
        return false
      }
      return this.selectedDocuments.length === this.collections.length
    },
    canDelete() {
      return true
    },
    indexExists() {
      return !!this.$store.state.index.indexesAndCollections[this.index]
    },
    loading() {
      if (
        this.$store.state.index.indexesAndCollections.loadingIndexes === true
      ) {
        return true
      }
      if (!this.indexExists) {
        return false
      }
      return this.$store.state.index.indexesAndCollections[this.index].loading
    },
    deletionConfirmed() {
      return (
        this.deleteConfirmation !== '' &&
        this.deleteConfirmation !== null &&
        this.deleteConfirmation === this.collectionToDelete
      )
    },
    deletionPromptFeedback() {
      if (this.deleteConfirmation === '' || this.deletionConfirmed) {
        return ''
      }
      return 'Confirmation is not matching collection name'
    },
    tableFields() {
      return [
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
          key: 'documents',
          label: 'Documents',
          sortable: true,
          class: 'CollectionList-document align-middle'
        },
        {
          class: 'CollectionList-actions align-middle text-right',
          key: 'actions',
          label: ''
        }
      ]
    },
    realtimeCollections() {
      const collections = this.$store.state.index.indexesAndCollections[
        this.index
      ]
        ? this.$store.state.index.indexesAndCollections[this.index].realtime
        : []

      return collections.map(collection => ({
        name: collection,
        documents: 'N/A',
        type: 'realtime'
      }))
    },
    storedCollections() {
      const rawStoredCollections = this.rawStoredCollections
        ? this.rawStoredCollections
        : this.$store.state.index.indexesAndCollections[this.index].stored

      return rawStoredCollections.map(({ collection, count }) => ({
        name: collection,
        documents: count,
        type: 'stored'
      }))
    },
    collections() {
      return [...this.realtimeCollections, ...this.storedCollections]
    }
  },
  methods: {
    onToggleAllClicked() {
      if (this.allChecked) {
        this.selectedDocuments = []
        return
      }
      this.selectedDocuments = []
      this.selectedDocuments = this.collections.map(
        collection => collection.name
      )
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
    onDeleteCollectionClicked(name) {
      this.collectionToDelete = name
      this.$bvModal.show('deleteCollectionPrompt')
    },
    resetDeletePrompt() {
      this.collectionToDelete = ''
      this.deleteConfirmation = ''
      this.DeleteCollections()
    },
    truncateName,
    async fetchStoredCollections() {
      const storedCollections = this.$store.state.index.indexesAndCollections[
        this.index
      ]
        ? this.$store.state.index.indexesAndCollections[this.index].stored
        : []

      const promises = storedCollections.map(collection => {
        return this.$kuzzle.document
          .count(this.index, collection)
          .then(count => ({ collection, count }))
      })

      try {
        this.rawStoredCollections = await Promise.all(promises)
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
    DeleteCollections() {
      if (this.selectedDocuments.length > 0) {
        this.onDeleteCollectionClicked(this.selectedDocuments[0])
      }
    },
    async onDeleteCollectionConfirmed() {
      if (!this.deleteConfirmation) {
        return
      }
      try {
        await this.$store.direct.dispatch.index.deleteCollection({
          index: this.index,
          collection: this.collectionToDelete
        })
        this.selectedDocuments.shift()
        this.$bvModal.hide('deleteCollectionPrompt')

        await this.fetchStoredCollections()
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title: 'Ooops! Something went wrong while deleting the collection.',
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
  mounted() {
    this.fetchStoredCollections()
  },
  watch: {
    index: {
      handler() {
        this.fetchStoredCollections()
      }
    }
  }
}
</script>
