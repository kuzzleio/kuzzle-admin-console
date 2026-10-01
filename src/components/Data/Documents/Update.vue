<template>
  <div class="DocumentUpdate mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <template v-if="hasRights">
      <headline> Edit document </headline>

      <Alert v-if="showAlert" class="mb-4" variant="destructive">
        <b>Warning!</b> This document has been edited while you were editing it. If you save now,
        you will overwrite someone else's modifications.
      </Alert>
      <div v-if="loading" class="mt-12 flex justify-center">
        <Spinner label="Loading the document" size="lg" />
      </div>
      <create-or-update
        v-else
        :id="id"
        :index="indexName"
        :collection="collectionName"
        :document="document"
        :mapping="mappingAttributes"
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import omit from 'lodash/omit';
import { useRouter } from 'vue-router';

import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/composables/useToast';
import { logger } from '@/plugins/logger';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';

import PageNotAllowed from '@/components/Common/PageNotAllowed.vue';
import Headline from '@/components/Materialize/Headline.vue';
import CreateOrUpdate from './Common/CreateOrUpdate.vue';

const props = defineProps<{
  collectionName: string;
  id: string;
  indexName: string;
}>();

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const storageIndexStore = useStorageIndexStore();

const document = ref<Record<string, unknown>>({});
const loading = ref(false);
const showAlert = ref(false);

// L'identifiant de la souscription n'est pas affiché : il n'a pas à être réactif.
let room: string | undefined;

const index = computed(() => storageIndexStore.getOneIndex(props.indexName));

const collection = computed(() =>
  index.value ? storageIndexStore.getOneCollection(index.value, props.collectionName) : undefined,
);

const mappingAttributes = computed(() =>
  collection.value?.mapping ? omit(collection.value.mapping, '_kuzzle_info') : null,
);

const hasRights = computed((): boolean =>
  authStore.canEditDocument(props.indexName, props.collectionName),
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

onMounted(async () => {
  fetch();
  room = await sdk().realtime.subscribe(
    props.indexName,
    props.collectionName,
    { ids: { values: [props.id] } },
    () => {
      showAlert.value = true;
    },
  );
});

onUnmounted(async () => {
  if (room) {
    await sdk().realtime.unsubscribe(room);
  }
});

function goToList(): void {
  router.push({
    name: 'DocumentList',
    params: { indexName: props.indexName, collectionName: props.collectionName },
  });
}

async function onSubmit(
  submitted: Record<string, unknown>,
  _id: string | number | undefined,
  replace = false,
): Promise<void> {
  try {
    delete submitted._id;
    const action = replace ? 'replace' : 'update';
    await sdk().document[action](props.indexName, props.collectionName, props.id, submitted, {
      refresh: 'wait_for',
    });
    goToList();
  } catch (err) {
    logger.error(err);
    toast.warning(
      'Ooops! Something went wrong while persisting the document.',
      (err as Error).message,
    );
  }
}

function onDocumentChange(changed: Record<string, unknown>): void {
  document.value = changed;
}

async function fetch(): Promise<void> {
  showAlert.value = false;
  loading.value = true;
  try {
    const res = await sdk().document.get(props.indexName, props.collectionName, props.id);
    document.value = omit(res._source, '_kuzzle_info');
    loading.value = false;
  } catch (err) {
    logger.error(err);
    toast.warning(
      'Ooops! Something went wrong while loading the document.',
      (err as Error).message,
    );
  }
}
</script>
