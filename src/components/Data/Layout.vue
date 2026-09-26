<template>
  <ResizablePanelGroup class="DataLayout" @resize="saveNewPaneSize">
    <ResizablePanel
      class="DataLayout-sidebarWrapper z-1 h-full min-w-[var(--sidebar-width)] overflow-auto bg-muted"
      :style="paneSize ? { width: paneSize } : undefined"
      data-cy="DataLayout-sidebarWrapper"
    >
      <treeview
        :index-name="$route.params.indexName"
        :collection-name="$route.params.collectionName"
      />
    </ResizablePanel>
    <ResizableHandle data-cy="sidebarResizer" label="Resize the index tree" />
    <ResizablePanel class="DataLayout-contentWrapper h-full grow overflow-auto p-6">
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
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
<script>
import { mapState } from 'pinia';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore, useStorageIndexStore } from '@/stores';
import { setPersistedItem, getPersistedItem } from './itemsStorage';

import Treeview from '@/components/Data/Leftnav/Treeview.vue';
import DataNotFound from './Data404.vue';

export default {
  name: 'DataLayout',
  components: {
    DataNotFound,
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
    Spinner,
    Treeview,
  },
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      isFetching: true,
      dataNotFound: false,
      viewIsInitializing: false,
      paneSize: '',
    };
  },
  computed: {
    ...mapState(useStorageIndexStore, ['loadingIndexes', 'loadingCollections']),
    ...mapState(useAuthStore, ['isAuthenticated']),
    indexName() {
      return this.$route.params.indexName;
    },
    collectionName() {
      return this.$route.params.collectionName;
    },
    loading() {
      if (this.isFetching) {
        return true;
      }

      if (this.loadingIndexes) {
        return true;
      }

      if (this.indexName && this.loadingCollections(this.indexName)) {
        return true;
      }

      return false;
    },
  },
  watch: {
    '$route.params.indexName': {
      handler() {
        this.lazyLoadingSequence();
      },
    },
    '$route.params.collectionName': {
      handler() {
        this.lazyLoadingSequence();
      },
    },
  },
  async mounted() {
    await this.lazyLoadingSequence();
    const persisted = getPersistedItem('paneSize');
    this.paneSize = persisted ? `${persisted}px` : '';
  },
  methods: {
    /*
     * `vue-multipane` émettait le nœud DOM redimensionné et écrivait sa
     * largeur lui-même ; la primitive émet la taille et laisse le site d'appel
     * décider — ici : la persister (ADR-0021).
     */
    saveNewPaneSize(width) {
      setPersistedItem('paneSize', width);
      this.paneSize = `${width}px`;
    },
    async fetchIndexList() {
      try {
        await this.storageIndexStore.fetchIndexList();
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while fetching the indexes list.',
          'The complete error has been printed to the console.',
        );
      }
    },
    async fetchCollectionList() {
      try {
        const index = this.storageIndexStore.getOneIndex(this.indexName);

        if (!index) {
          this.handleDataNotFound();
          return;
        }

        await this.storageIndexStore.fetchCollectionList(index);
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while fetching the collection list.',
          'The complete error has been printed to the console.',
        );
      }
    },
    async fetchCollectionMapping() {
      try {
        const index = this.storageIndexStore.getOneIndex(this.indexName);

        if (!index) {
          this.handleDataNotFound();
          return;
        }

        const collection = this.storageIndexStore.getOneCollection(index, this.collectionName);

        if (!collection) {
          this.handleDataNotFound();
          return;
        }

        await this.storageIndexStore.fetchCollectionMapping({ index, collection });
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while fetching the collection mapping.',
          'The complete error has been printed to the console.',
        );
      }
    },
    handleDataNotFound() {
      this.dataNotFound = true;
    },
    // @todo : handle lazy loading sequence only on the authenticated routes
    async lazyLoadingSequence() {
      if (!this.isAuthenticated) {
        this.$log.warn('Lazy loading sequence started with a non-authenticated user.');
        return;
      }

      this.isFetching = true;
      this.dataNotFound = false;

      await this.fetchIndexList();

      if (this.$route.params.indexName) {
        await this.fetchCollectionList();
      }

      if (this.$route.params.indexName && this.$route.params.collectionName) {
        await this.fetchCollectionMapping();
      }

      this.isFetching = false;
    },
  },
};
</script>
