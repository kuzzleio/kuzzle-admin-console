<template>
  <div class="DocumentCreate mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <template v-if="hasRights">
      <headline> Create a new document </headline>

      <create-or-update
        v-if="index && collection"
        :index="indexName"
        :collection="collectionName"
        :mapping="mappingAttributes"
        :document="newDocument"
        @cancel="goToList"
        @submit="onSubmit"
        @document-change="onDocumentChange"
      />
    </template>
    <template v-else>
      <page-not-allowed />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import omit from 'lodash/omit';
import { useRouter } from 'vue-router';

import { useToast } from '@/composables/useToast';
import { logger } from '@/plugins/logger';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';

import PageNotAllowed from '@/components/Common/PageNotAllowed.vue';
import Headline from '@/components/Materialize/Headline.vue';
import CreateOrUpdate from './Common/CreateOrUpdate.vue';

const props = defineProps<{
  collectionName: string;
  indexName: string;
}>();

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const storageIndexStore = useStorageIndexStore();

const newDocument = ref<Record<string, unknown>>({});

const index = computed(() => storageIndexStore.getOneIndex(props.indexName));

const collection = computed(() =>
  index.value ? storageIndexStore.getOneCollection(index.value, props.collectionName) : undefined,
);

const mappingAttributes = computed(() =>
  collection.value?.mapping ? omit(collection.value.mapping, '_kuzzle_info') : null,
);

const hasRights = computed((): boolean =>
  authStore.canCreateDocument(props.indexName, props.collectionName),
);

/* Le SDK de la connexion courante. Appelé dans un `try` : son absence y est
   une erreur comme une autre. */
function sdk() {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    throw new Error('No Kuzzle SDK for the current environment');
  }
  return kuzzle;
}

function goToList(): void {
  router.push({
    name: 'DocumentList',
    params: { indexName: props.indexName, collectionName: props.collectionName },
  });
}

async function onSubmit(
  document: Record<string, unknown>,
  id: string | number | undefined,
): Promise<void> {
  try {
    await sdk().document.create(
      props.indexName,
      props.collectionName,
      document,
      id === undefined ? undefined : String(id),
      { refresh: 'wait_for' },
    );

    await fetchCollectionMapping();

    goToList();
  } catch (err) {
    logger.error(err);
    toast.warning(
      'Ooops! Something went wrong while persisting the document.',
      (err as Error).message,
    );
  }
}

function onDocumentChange(document: Record<string, unknown>): void {
  newDocument.value = document;
}

async function fetchCollectionMapping(): Promise<void> {
  try {
    if (!index.value || !collection.value) {
      throw new Error(`Collection "${props.collectionName}" not found`);
    }
    await storageIndexStore.fetchCollectionMapping({
      index: index.value,
      collection: collection.value,
    });
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while counting documents in collections.',
      'The complete error has been printed to the console.',
    );
  }
}
</script>
