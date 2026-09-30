<template>
  <div class="CollectionUpdate mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <div v-if="hasRights" class="flex h-full flex-col">
      <create-or-update
        v-if="index && collection"
        headline="Update collection"
        submit-label="Update"
        :collection="collection.name"
        :index="index.name"
        :mapping="fullMappings"
        :realtime-only="collection.isRealtime()"
        @submit="update"
      />
    </div>
    <div v-else>
      <page-not-allowed />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { omit } from 'lodash';
import { useRouter } from 'vue-router';

import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/plugins/logger';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import PageNotAllowed from '@/components/Common/PageNotAllowed.vue';
import CreateOrUpdate from './CreateOrUpdate.vue';

const props = defineProps<{
  collectionName: string;
  indexName: string;
}>();

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const storageIndexStore = useStorageIndexStore();

const hasRights = computed((): boolean =>
  authStore.canEditCollection(props.indexName, props.collectionName),
);

const index = computed(() => storageIndexStore.getOneIndex(props.indexName));

const collection = computed(() =>
  index.value ? storageIndexStore.getOneCollection(index.value, props.collectionName) : undefined,
);

// Lue seulement sous `v-if="index && collection"`.
const fullMappings = computed(() => ({
  dynamic: collection.value?.dynamic,
  properties: omit(collection.value?.mapping, '_kuzzle_info'),
}));

async function update(payload: { name: string; mapping: object }): Promise<void> {
  if (!index.value) {
    return;
  }

  try {
    await storageIndexStore.updateCollection({
      index: index.value,
      name: payload.name,
      mapping: payload.mapping,
    });

    router.push({
      name: 'Collections',
      params: { indexName: index.value.name },
    });
  } catch (e) {
    logger.error(e);
    toast.warning('Ooops! Something went wrong while updating the collection.', caught(e).message);
  }
}
</script>
