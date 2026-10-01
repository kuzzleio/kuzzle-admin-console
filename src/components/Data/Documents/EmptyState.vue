<template>
  <Card class="EmptyState" data-cy="DocumentsEmptyState">
    <CardContent class="flex flex-col items-center gap-3 text-center">
      <i
        aria-hidden="true"
        class="fas fa-6x text-muted-foreground"
        :class="{
          'fa-ellipsis-h': !hasNewDocuments,
          'fa-file-alt': hasNewDocuments,
        }"
      />
      <CardTitle class="font-heading text-headline font-extrabold text-muted-foreground">
        <span v-if="hasNewDocuments">There are new documents in the collection</span>
        <span v-else>No documents matching your filters</span>
      </CardTitle>
      <CardDescription v-if="hasNewDocuments">
        You can refresh the collection by hitting the "Refresh" button on top of the page
      </CardDescription>
      <CardDescription v-else-if="authStore.canCreateDocument(index, collection)">
        You can try changing your filters or create a new document by hitting the "Create New
        Document" button on top of the page.
      </CardDescription>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores';

withDefaults(
  defineProps<{
    collection?: string;
    hasNewDocuments?: boolean;
    index?: string;
  }>(),
  {
    collection: '',
    hasNewDocuments: false,
    index: '',
  },
);

const authStore = useAuthStore();
</script>
