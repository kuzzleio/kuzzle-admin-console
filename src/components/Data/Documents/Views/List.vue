<template>
  <div class="DocumentsListView" data-cy="DocumentsListView">
    <div class="mb-3 flex flex-row flex-wrap items-center gap-2">
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

<script setup lang="ts">
import { computed } from 'vue';

import NewDocumentsBadge from '../Common/NewDocumentsBadge.vue';
import DocumentListItem from '../DocumentListItem.vue';
import type { DocumentNotification, KuzzleDocument } from '../types';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/stores';

import PerPageSelector from '@/components/Common/PerPageSelector.vue';

const props = withDefaults(
  defineProps<{
    allChecked: boolean;
    autoSync?: boolean;
    collection: string;
    currentPageSize?: number;
    dateFields: string[];
    documents: KuzzleDocument[];
    hasNewDocuments?: boolean;
    index: string;
    isFetching?: boolean;
    notifications?: Record<string, DocumentNotification | undefined>;
    selectedDocuments: string[];
    totalDocuments?: number;
  }>(),
  {
    currentPageSize: 25,
    notifications: () => ({}),
    totalDocuments: undefined,
  },
);

defineEmits<{
  (e: 'bulk-delete'): void;
  (e: 'change-page-size', size: number): void;
  (e: 'checkbox-click', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'refresh'): void;
  (e: 'toggle-all'): void;
}>();

const authStore = useAuthStore();

const hasSelectedDocuments = computed((): boolean => props.selectedDocuments.length > 0);

const bulkDeleteEnabled = computed(
  (): boolean =>
    authStore.canDeleteDocument(props.index, props.collection) && hasSelectedDocuments.value,
);

function isChecked(id: string): boolean {
  return props.selectedDocuments.indexOf(id) > -1;
}
</script>
