<template>
  <div class="DocumentsListView" data-cy="DocumentsListView">
    <div class="mb-3 flex flex-row items-center gap-2">
      <div class="flex grow items-center gap-2">
        <Button
          data-cy="DocumentsListView-toggleAllBtn"
          variant="outline"
          @click="$emit('toggle-all')"
        >
          <i aria-hidden="true" :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`" />
          Toggle all
        </Button>

        <Button
          data-cy="DocumentsListView-bulkDeleteBtn"
          :disabled="!bulkDeleteEnabled"
          variant="destructive"
          @click="$emit('bulk-delete')"
        >
          <i aria-hidden="true" class="fa fa-minus-circle" />
          Delete
        </Button>
      </div>
      <Spinner
        v-if="isFetching"
        class="text-muted-foreground"
        label="Loading documents"
        size="sm"
      />
      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
      <new-documents-badge :has-new-documents="hasNewDocuments" @refresh="$emit('refresh')" />
    </div>
    <ul class="m-0 flex w-full list-none flex-col gap-1 p-0">
      <document-list-item
        v-for="document in documents"
        :key="document._id"
        :auto-sync="autoSync"
        :collection="collection"
        :date-fields="dateFields"
        :document="document"
        :index="index"
        :is-checked="isChecked(document._id)"
        :notification="notifications[document._id]"
        @checkbox-click="$emit('checkbox-click', $event)"
        @delete="$emit('delete', $event)"
      />
    </ul>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import NewDocumentsBadge from '../Common/NewDocumentsBadge.vue';
import DocumentListItem from '../DocumentListItem.vue';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/stores';

import PerPageSelector from '@/components/Common/PerPageSelector.vue';

export default {
  name: 'DocumentsListView',
  components: {
    Button,
    DocumentListItem,
    NewDocumentsBadge,
    PerPageSelector,
    Spinner,
  },
  props: {
    allChecked: {
      type: Boolean,
      required: true,
    },
    collection: {
      type: String,
      required: true,
    },
    currentPageSize: {
      type: Number,
      default: 25,
    },
    documents: {
      type: Array,
      required: true,
    },
    dateFields: {
      type: Array,
      required: true,
    },
    index: {
      type: String,
      required: true,
    },
    isFetching: {
      type: Boolean,
    },
    selectedDocuments: {
      type: Array,
      required: true,
    },
    totalDocuments: {
      type: Number,
    },
    notifications: {
      type: Object,
      default: () => ({}),
    },
    hasNewDocuments: Boolean,
    autoSync: Boolean,
  },
  computed: {
    ...mapState(useAuthStore, ['canDeleteDocument']),
    hasSelectedDocuments() {
      return this.selectedDocuments.length > 0;
    },
    bulkDeleteEnabled() {
      return this.canDeleteDocument(this.index, this.collection) && this.hasSelectedDocuments;
    },
  },
  methods: {
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1;
    },
  },
};
</script>
