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
      <treeview
        :index-name="$route.params.indexName"
        :collection-name="$route.params.collectionName"
      />
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
<script>
import { mapState } from 'pinia';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Spinner } from '@/components/ui/spinner';
import { useSideBySide } from '@/composables/useSideBySide';
import { useAuthStore, useStorageIndexStore } from '@/stores';
import { cssPixels } from '@/utils';
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
      sideBySide: useSideBySide(),
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      isFetching: true,
      dataNotFound: false,
      viewIsInitializing: false,
      /*
       * Lues avant le montage : `reka-ui` ne prend `default-size` qu'à
       * l'enregistrement du panneau.
       */
      paneSize: Number(getPersistedItem('paneSize')) || cssPixels('--sidebar-width'),
      sidebarWidth: cssPixels('--sidebar-width'),
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
  },
  methods: {
    /*
     * Le groupe émet les tailles dans l'unité de chaque panneau : celle de
     * l'arbre en pixels, comme la valeur déjà persistée (ADR-0021). Empilés,
     * les panneaux n'ont pas de largeur choisie : rien à retenir.
     */
    saveNewPaneSize([width]) {
      if (this.sideBySide) {
        setPersistedItem('paneSize', String(Math.round(width)));
      }
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
