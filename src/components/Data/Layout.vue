<template>
  <!--
    Sous `md`, l'arbre passe au-dessus du contenu, sur une hauteur bornée :
    côte à côte, ses 252 px ne laissaient qu'une centaine de pixels au contenu
    d'un écran de 375. `reka-ui` écrit la direction, le `flex` et
    l'`overflow` des panneaux en style en ligne : les classes qui les
    remplacent portent un `!` (G-099).
  -->
  <ResizablePanelGroup
    class="DataLayout max-md:flex-col!"
    direction="horizontal"
    @layout="saveNewPaneSize"
  >
    <ResizablePanel
      class="DataLayout-sidebarWrapper z-1 max-h-[35vh] overflow-auto! bg-muted max-md:flex-none! md:max-h-none"
      data-cy="DataLayout-sidebarWrapper"
      :default-size="paneSize"
      :min-size="sidebarWidth"
      size-unit="px"
    >
      <treeview :index-name="indexName" :collection-name="collectionName" />
    </ResizablePanel>
    <ResizableHandle
      v-if="sideBySide"
      aria-label="Resize the index tree"
      data-cy="sidebarResizer"
      with-handle
    />
    <ResizablePanel class="DataLayout-contentWrapper min-h-0 overflow-auto!">
      <!--
        Le padding vit dans un enfant : sur le panneau, avec `flex-basis: 0`,
        il est retiré de l'espace que `reka-ui` répartit, et l'arbre perdait
        la largeur de ce padding (G-099).
      -->
      <div class="box-border h-full p-4 md:p-6">
        <!--
          `b-overlay` avec `opacity="0"` ne servait qu'à centrer une roue de
          chargement : son voile était transparent, et le contenu qu'il
          recouvrait n'était de toute façon pas rendu (`v-if="!loading"`).
          Il était aussi l'ancêtre positionné du `.full-screen` des filtres :
          le `relative` le remplace, sans quoi le plein écran recouvre toute
          l'application (E-02 de la comparaison v4 / v5).
        -->
        <div v-if="loading" class="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
        <div v-else class="relative h-full">
          <data-not-found v-if="dataNotFound" class="mt-3" />
          <router-view
            @start-init="viewIsInitializing = true"
            @end-init="viewIsInitializing = false"
          />
        </div>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Spinner } from '@/components/ui/spinner';
import { useSideBySide } from '@/composables/useSideBySide';
import { useToast } from '@/composables/useToast';
import { logger } from '@/plugins/logger';
import { useAuthStore, useStorageIndexStore } from '@/stores';
import { cssPixels } from '@/utils';
import { setPersistedItem, getPersistedItem } from './itemsStorage';

import Treeview from '@/components/Data/Leftnav/Treeview.vue';
import DataNotFound from './Data404.vue';

const route = useRoute();
const toast = useToast();
const sideBySide = useSideBySide();
const authStore = useAuthStore();
const storageIndexStore = useStorageIndexStore();

const isFetching = ref(true);
const dataNotFound = ref(false);
const viewIsInitializing = ref(false);
/*
 * Lues avant le montage : `reka-ui` ne prend `default-size` qu'à
 * l'enregistrement du panneau.
 */
const paneSize = Number(getPersistedItem('paneSize')) || cssPixels('--sidebar-width');
const sidebarWidth = cssPixels('--sidebar-width');

function routeParam(name: string): string | undefined {
  const value = route.params[name];
  return typeof value === 'string' ? value : undefined;
}

const indexName = computed(() => routeParam('indexName'));
const collectionName = computed(() => routeParam('collectionName'));

const loading = computed((): boolean => {
  if (isFetching.value) {
    return true;
  }

  if (storageIndexStore.loadingIndexes) {
    return true;
  }

  if (indexName.value && storageIndexStore.loadingCollections(indexName.value)) {
    return true;
  }

  return false;
});

watch(() => route.params.indexName, lazyLoadingSequence);
watch(() => route.params.collectionName, lazyLoadingSequence);

onMounted(async () => {
  await lazyLoadingSequence();
});

/*
 * Le groupe émet les tailles dans l'unité de chaque panneau : celle de
 * l'arbre en pixels, comme la valeur déjà persistée (ADR-0021). Empilés,
 * les panneaux n'ont pas de largeur choisie : rien à retenir.
 */
function saveNewPaneSize([width]: number[]): void {
  if (sideBySide.value) {
    setPersistedItem('paneSize', String(Math.round(width)));
  }
}

async function fetchIndexList(): Promise<void> {
  try {
    await storageIndexStore.fetchIndexList();
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while fetching the indexes list.',
      'The complete error has been printed to the console.',
    );
  }
}

async function fetchCollectionList(): Promise<void> {
  try {
    const index = indexName.value ? storageIndexStore.getOneIndex(indexName.value) : undefined;

    if (!index) {
      handleDataNotFound();
      return;
    }

    await storageIndexStore.fetchCollectionList(index);
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while fetching the collection list.',
      'The complete error has been printed to the console.',
    );
  }
}

async function fetchCollectionMapping(): Promise<void> {
  try {
    const index = indexName.value ? storageIndexStore.getOneIndex(indexName.value) : undefined;

    if (!index) {
      handleDataNotFound();
      return;
    }

    const collection = collectionName.value
      ? storageIndexStore.getOneCollection(index, collectionName.value)
      : undefined;

    if (!collection) {
      handleDataNotFound();
      return;
    }

    await storageIndexStore.fetchCollectionMapping({ index, collection });
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while fetching the collection mapping.',
      'The complete error has been printed to the console.',
    );
  }
}

function handleDataNotFound(): void {
  dataNotFound.value = true;
}

// @todo : handle lazy loading sequence only on the authenticated routes
async function lazyLoadingSequence(): Promise<void> {
  if (!authStore.isAuthenticated) {
    logger.warn('Lazy loading sequence started with a non-authenticated user.');
    return;
  }

  isFetching.value = true;
  dataNotFound.value = false;

  await fetchIndexList();

  if (route.params.indexName) {
    await fetchCollectionList();
  }

  if (route.params.indexName && route.params.collectionName) {
    await fetchCollectionMapping();
  }

  isFetching.value = false;
}
</script>
