<template>
  <div class="DocumentsListView">
    <b-row no-gutters class="mb-2">
      <b-col cols="8">
        <b-button
          variant="outline-dark"
          class="mr-2"
          @click="$emit('toggle-all')"
        >
          <i
            :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'} left`"
          />
          Toggle all
        </b-button>

        <b-button
          variant="outline-danger"
          class="mr-2"
          :disabled="!bulkDeleteEnabled"
          @click="$emit('bulk-delete')"
        >
          <i class="fa fa-minus-circle left" />
          Delete
        </b-button>

        <b-button
          variant="outline-secondary"
          class="mr-2"
          @click.prevent="$emit('refresh')"
        >
          <i class="fas fa-sync-alt left" />
          Refresh
        </b-button>
      </b-col>
      <b-col cols="4" class="text-right"
        >Show
        <b-form-select
          class="mx-2"
          style="width: unset"
          :options="itemsPerPage"
          :value="currentPageSize"
          @change="$emit('change-page-size', $event)"
        >
        </b-form-select>
        <span v-if="totalDocuments"
          >of {{ totalDocuments }} total items.</span
        ></b-col
      >
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
          @checkbox-click="$emit('checkbox-click', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import DocumentListItem from '../DocumentListItem'
import { mapGetters } from 'vuex'

export default {
  name: 'DocumentsListView',
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
    currentPageSize: {
      type: Number,
      default: 10
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
    },
    totalDocuments: {
      type: Number
    }
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500]
    }
  },
  computed: {
    ...mapGetters('auth', ['canDeleteDocument']),
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
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    }
  }
}
</script>

<style></style>
