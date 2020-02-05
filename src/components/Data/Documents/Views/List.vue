<template>
  <div>
    <b-row no-gutters>
      <b-col cols="8" class="mt-2">
        <b-button
          variant="outline-dark"
          class="ml-0 mr-2"
          @click="$emit('toggle-all')"
        >
          <i
            :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'} left`"
          />
          Toggle all
        </b-button>

        <b-button
          variant="outline-danger"
          class="m-2"
          :disabled="!bulkDeleteEnabled"
          @click="$emit('bulk-delete')"
        >
          <i class="fa fa-minus-circle left" />
          Delete
        </b-button>

        <b-button
          variant="outline-secondary"
          class="m-2"
          @click.prevent="$emit('refresh')"
        >
          <i class="fas fa-sync-alt left" />
          Refresh
        </b-button>
      </b-col>
    </b-row>
    <b-list-group class="w-100">
      <b-list-group-item
        v-for="document in documents"
        class="p-2"
        data-cy="DocumentList-item"
        :key="document.id"
      >
        <document-list-item
          :document="document"
          :collection="collection"
          :index="index"
          :is-checked="isChecked(document.id)"
          @checkbox-click="$emit('checkbox-click')"
          @edit="$emit('edit')"
          @delete="$emit('delete')"
        />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import DocumentListItem from '../DocumentListItem'
import { canDeleteDocument } from '../../../../services/userAuthorization'
export default {
  components: {
    DocumentListItem
  },
  props: {
    allChecked: {
      type: Boolean,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    documents: {
      type: Array,
      required: true
    },
    index: {
      type: String,
      required: true
    },
    selectedDocuments: {
      type: Array,
      required: true
    }
  },
  computed: {
    hasSelectedDocuments() {
      return this.selectedDocuments.length > 0
    },
    bulkDeleteEnabled() {
      return (
        this.canDeleteDocument(this.index, this.collection) &&
        this.hasSelectedDocuments
      )
    }
  },
  methods: {
    canDeleteDocument,
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    }
  }
}
</script>

<style></style>
