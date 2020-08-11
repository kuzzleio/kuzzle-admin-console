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
            data-cy="CollectionList-create"
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
          <b-col sm="6" class="text-secondary">
            {{ collections.length }}
            {{ collections.length === 1 ? 'collection' : 'collections' }}
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
                        selectedCollections.length === filteredCollections.length
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
                  @click="DeleteCollections"
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
        <data-not-found v-if="!indexExists" class="mt-3"></data-not-found>

        <b-table
          v-else
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
              v-if="canCreateCollection(index)"
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
              :checked="isChecked(row.item.name)"
              @change="onCheckboxClick(row.item.name)"
            />
          </template>
          <template v-slot:cell(type)="type">
            <i
              class="fa fa-2x"
              :class="{
                'fa-bolt ml-2': type.value === 'realtime',
                'fa-th-list': type.value === 'stored'
              }"
              :title="type.value === 'realtime' ? 'Realtime' : 'Stored'"
            ></i>
          </template>
          <template v-slot:cell(name)="name">
            <b-link
              class="code"
              :data-cy="`CollectionList-name--${name.value}`"
              :title="name.value"
              :to="
                name.item.type === 'realtime'
                  ? {
                      name: 'WatchCollection',
                      params: { index, collection: name.value }
                    }
                  : {
                      name: 'DocumentList',
                      params: { index, collection: name.value }
                    }
              "
              >{{ truncateName(name.value) }}</b-link
            >
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
                      params: { index, collection: row.item.name }
                    }
                  : {
                      name: 'DocumentList',
                      params: { index, collection: row.item.name }
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
                row.item.type !== 'stored' ||
                  !canEditCollection(index, row.item.name)
              "
              :to="
                canEditCollection(index, row.item.name)
                  ? {
                      name: 'EditCollection',
                      params: { collection: row.item.name, index }
                    }
                  : ''
              "
              ><i class="fa fa-pencil-alt"></i
            ></b-button>
            <b-button
              class="mx-1"
              variant="link"
              title="Delete collection"
              :data-cy="`CollectionList-delete--${row.item.name}`"
              @click="onDeleteCollectionClicked(row.item.name)"
              ><i class="fa fa-trash"></i
            ></b-button>
          </template>
        </b-table>
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
          data-cy="DeleteCollectionPrompt-confirm"
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
export default {
  name: 'CollectionList',
  components: {
    DataNotFound,
    Headline,
    ListNotAllowed,
    MainSpinner,
    AutoFocusInput
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
      selectedCollections: []
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle']),
    ...mapGetters('auth', [
      'canSearchCollection',
      'canCreateCollection',
      'canEditCollection'
    ]),
    bulkDeleteEnabled() {
      return this.selectedCollections.length > 0
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
    onDeleteCollectionClicked(name) {
      this.collectionToDelete = name
      this.$bvModal.show('deleteCollectionPrompt')
    },
    deleteCollections() {
      if (this.selectedCollections.length > 0) {
        this.onDeleteCollectionClicked(this.selectedCollections[0])
      }
    },
    allChecked() {
      if (!this.selectedCollections || !this.filteredCollections) {
        return false
      }
      return this.selectedCollections.length === this.filteredCollections.length
    },
    onToggleAllClicked() {
      if (this.allChecked()) {
        this.selectedCollections = []
        return
      }
      this.selectedCollections = []
      this.selectedCollections = this.filteredCollections.map(
        collection => collection.name
      )
    },
    isChecked(name) {
      return this.selectedCollections.indexOf(name) > -1
    },
    onCheckboxClick(name) {
      let index = this.selectedCollections.indexOf(name)
      if (index === -1) {
        this.selectedCollections.push(name)
        return
      }
      this.selectedCollections.splice(index, 1)
    },
    resetDeletePrompt() {
      this.collectionToDelete = ''
      this.deleteConfirmation = ''
      this.selectedCollections.shift()
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
    async onDeleteCollectionConfirmed() {
      if (!this.deleteConfirmation) {
        return
      }
      try {
        await this.$store.direct.dispatch.index.deleteCollection({
          index: this.index,
          collection: this.collectionToDelete
        })

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
  async mounted() {
    await this.fetchStoredCollections()
    this.updateFilteredCollections(this.collections)
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
