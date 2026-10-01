<template>
  <div class="IndexBranch mt-2 overflow-hidden whitespace-nowrap">
    <!--
      Le chevron était un `<i>` cliquable : invisible au clavier, et muet pour
      un lecteur d'écran. C'est un bouton, et il annonce l'état de la branche.
    -->
    <Button
      :aria-expanded="open ? 'true' : 'false'"
      :aria-label="`Collections of index ${index.name}`"
      class="size-6 align-middle"
      :data-cy="`IndexBranch-toggle--${index.name}`"
      size="icon"
      variant="ghost"
      @click="onToggleBranchClicked"
    >
      <i
        aria-hidden="true"
        class="fa fa-caret-right text-muted-foreground transition-transform duration-200"
        :class="{ 'rotate-90': open }"
      />
    </Button>
    <router-link
      class="mx-1 truncate px-1 text-foreground"
      :data-cy="`Treeview-item-index-link--${index.name}`"
      :class="{ 'font-bold': isIndexActive(index.name) }"
      :title="index.name"
      :to="{ name: 'Collections', params: { indexName: index.name } }"
    >
      <i class="fa fa-database mr-1 text-muted-foreground" aria-hidden="true" />
      <HighlightedSpan :value="index.name" :filter="filter" />

      <template v-if="index.collectionsCount !== undefined"
        >&nbsp;({{ index.collectionsCount }})</template
      >
    </router-link>
    <Spinner v-if="isLoading" size="sm" />
    <!--
      Le dépliement animait un `max-height: 0` vers un `max-height: 2000px`
      arbitraire, qui plafonnait les très longues listes. La grille passe de
      `0fr` à `1fr` : la hauteur réelle du contenu, sans nombre magique. Replié,
      le contenu fait toujours zéro pixel — ce que les specs lisent comme
      « non visible ».
    -->
    <div
      v-if="collectionsFetched"
      class="grid pl-6 transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <template v-if="orderedFilteredCollections.length">
          <div
            v-for="collection in orderedFilteredCollections"
            :key="`${collection.name}-${collection.type}`"
            class="mx-1 mt-2 truncate px-1 text-foreground"
            :class="{
              'font-bold': isCollectionActive(index.name, collection.name),
            }"
            :data-cy="`Treeview-item--${collection.name}`"
            :title="collection.name"
          >
            <template v-if="collection.isRealtime()">
              <i
                class="fa fa-bolt mr-2 ml-1 text-muted-foreground"
                aria-hidden="true"
                title="Volatile collection"
              />
              <router-link
                class="text-foreground"
                :to="{
                  name: 'WatchCollection',
                  params: {
                    indexName: index.name,
                    collectionName: collection.name,
                  },
                }"
              >
                <HighlightedSpan :value="collection.name" :filter="filter" />
              </router-link>
            </template>
            <template v-else>
              <i
                class="fa fa-th-list mr-1 text-muted-foreground"
                aria-hidden="true"
                title="Persisted collection"
              />
              <router-link
                class="text-foreground"
                :to="{
                  name: 'DocumentList',
                  params: {
                    indexName: index.name,
                    collectionName: collection.name,
                  },
                }"
              >
                <HighlightedSpan :value="collection.name" :filter="filter" />
              </router-link>
            </template>
          </div>
        </template>
        <template v-else><span class="text-muted-foreground">no collections</span></template>
        <Button
          v-if="showMoreCollectionsDisplay"
          class="mx-1 h-auto px-1"
          size="sm"
          variant="link"
          @click="toggleShowMoreCollections"
        >
          <template v-if="!showMoreCollections">Show More</template>
          <template v-else>Show only results</template>
        </Button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/composables/useToast';
import { logger } from '@/lib/logger';
import { useStorageIndexStore } from '@/stores';
import type { Index } from '@/stores/types/storage-index';

import HighlightedSpan from '@/components/Common/HighlightedSpan.vue';

const props = defineProps<{
  index: Index;
  browsedIndexName?: string;
  browsedCollectionName?: string;
  filter: string;
}>();

const toast = useToast();
const storageIndexStore = useStorageIndexStore();

const open = ref(false);
const showMoreCollections = ref(false);
const collectionsFetched = ref(false);
const isLoading = ref(false);

const showMoreCollectionsDisplay = computed((): boolean => {
  const collections = props.index.collections;

  return (
    props.filter.length > 0 &&
    collections != null &&
    collections.filter((col) => col.name.indexOf(props.filter) !== -1).length !== collections.length
  );
});

const orderedFilteredCollections = computed(() => {
  if (!props.index.collections) {
    return [];
  }

  return props.index.collections
    .filter((col) => col.name.indexOf(props.filter) !== -1 || showMoreCollections.value)
    .sort();
});

watch(() => props.browsedIndexName, testOpen);
watch(() => props.browsedCollectionName, testOpen);
watch(
  () => props.filter,
  () => {
    if (
      props.index.collections &&
      props.index.collections.filter((col) => col.name.indexOf(props.filter) !== -1).length > 0
    ) {
      open.value = true;
    }

    if (props.filter === '') {
      open.value = false;
    }
  },
);

onMounted(async () => {
  await testOpen();
});

async function onToggleBranchClicked(): Promise<void> {
  if (!open.value) {
    await fetchCollections();
  }
  toggleBranch();
}

async function fetchCollections(): Promise<void> {
  try {
    isLoading.value = true;
    await storageIndexStore.fetchCollectionList(props.index);
    collectionsFetched.value = true;
  } catch (error) {
    logger.error(error);
    toast.danger(
      'Ooops! Something went wrong while fetching the collections.',
      'The complete error has been printed to the console.',
    );
  }
  isLoading.value = false;
}

function toggleBranch(): void {
  // TODO This state should be one day persistent across page refreshes
  // NJE edit: not today...
  open.value = !open.value;
}

function toggleShowMoreCollections(): void {
  showMoreCollections.value = !showMoreCollections.value;
}

async function testOpen(): Promise<void> {
  if (props.browsedIndexName === props.index.name) {
    await fetchCollections();
    open.value = true;
  }
}

function isIndexActive(indexName: string): boolean {
  return props.browsedIndexName === indexName && !props.browsedCollectionName;
}

function isCollectionActive(indexName: string, collectionName: string): boolean {
  return props.browsedIndexName === indexName && props.browsedCollectionName === collectionName;
}
</script>
