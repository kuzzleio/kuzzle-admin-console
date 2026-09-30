<template>
  <div
    v-if="index"
    class="CollectionCreate mx-auto flex h-full w-full max-w-6xl flex-col px-4"
    data-cy="CollectionCreate"
  >
    <create-or-update
      v-if="hasRights"
      headline="Create a new collection"
      submit-label="Create"
      :index="index.name"
      @submit="create"
    />
    <page-not-allowed v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/plugins/logger';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import PageNotAllowed from '@/components/Common/PageNotAllowed.vue';
import CreateOrUpdate from './CreateOrUpdate.vue';

const props = defineProps<{ indexName: string }>();

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const storageIndexStore = useStorageIndexStore();

const index = computed(() => storageIndexStore.getOneIndex(props.indexName));

// Lue seulement sous `v-if="index"`.
const hasRights = computed((): boolean =>
  index.value ? authStore.canCreateCollection(index.value.name) : false,
);

async function create(payload: { name: string; mapping: object }): Promise<void> {
  if (!index.value) {
    return;
  }

  try {
    await storageIndexStore.createCollection({
      index: index.value,
      name: payload.name,
      mapping: payload.mapping,
    });

    router.push({
      name: 'Collections',
      params: { indexName: index.value.name },
    });
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while creating the collection.',
      caught(error).message,
    );
  }
}
</script>
