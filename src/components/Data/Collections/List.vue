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
          <b-col sm="8" class="text-secondary">
            {{ collections.length }}
            {{ collections.length === 1 ? 'collection' : 'collections' }}
          </b-col>
          <b-col sm="4">
            <b-input-group>
              <template v-slot:prepend>
                <b-input-group-text>Filter</b-input-group-text>
              </template>
              <b-form-input
                v-model="filter"
                :disabled="collections.length === 0"
              ></b-form-input>
            </b-input-group>
          </b-col>
        </b-row>
        <data-not-found v-if="!indexExists" class="mt-3"></data-not-found>

        <b-table
          v-else
          striped
          outlined
          show-empty
          :items="collections"
          :fields="tableFields"
          :filter="filter"
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
          <template v-slot:cell(type)="type">
            <i
              class="fa fa-2x"
              :class="{
                'fa-bolt ml-2': type.value === 'realtime',
                'fa-th-list': type.value === 'stored'
              }"
              :title="type.value === 'realtime' ? 'Realtime' : 'Persisted'"
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
import Headline from '../../Materialize/Headline'
import ListNotAllowed from '../../Common/ListNotAllowed'
import MainSpinner from '../../Common/MainSpinner'
import {
  canDeleteIndex,
  canSearchIndex,
  canSearchCollection,
  canCreateCollection,
  canEditCollection
} from '../../../services/userAuthorization'
import { truncateName } from '../../../utils'
import Title from '../../../directives/title.directive'
import DataNotFound from '../Data404'

export default {
  name: 'CollectionList',
  components: {
    DataNotFound,
    Headline,
    ListNotAllowed,
    MainSpinner
  },
  directives: {
    Title
  },
  props: {
    index: String
  },
  data() {
    return {
      filter: '',
      collectionToDelete: '',
      deleteConfirmation: ''
    }
  },
  computed: {
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
          class: 'CollectionList-actions align-middle text-right',
          key: 'actions',
          label: ''
        }
      ]
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
        ...this.realtimeCollections.map(c => ({
          name: c,
          type: 'realtime'
        })),
        ...this.storedCollections.map(c => ({
          name: c,
          type: 'stored'
        }))
      ].sort((a, b) => (a.name < b.name ? -1 : 1))
    }
  },
  methods: {
    canDeleteIndex,
    canSearchIndex,
    canSearchCollection,
    canCreateCollection,
    canEditCollection,
    onDeleteCollectionClicked(name) {
      this.collectionToDelete = name
      this.$bvModal.show('deleteCollectionPrompt')
    },
    resetDeletePrompt() {
      this.collectionToDelete = ''
      this.deleteConfirmation = ''
    },
    truncateName,
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
    }
  }
}
</script>
