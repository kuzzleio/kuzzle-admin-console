<template>
  <Multipane
    class="DataLayout Custom-resizer tw:flex tw:h-full tw:flex-row tw:flex-nowrap"
    layout="vertical"
    @paneResizeStop="saveNewPaneSize($event)"
  >
    <div
      class="DataLayout-sidebarWrapper tw:z-1 tw:h-full tw:min-w-[var(--sidebar-width)] tw:overflow-auto tw:bg-muted"
      :style="{ width: paneSize }"
      data-cy="DataLayout-sidebarWrapper"
    >
      <treeview
        :index-name="$route.params.indexName"
        :collection-name="$route.params.collectionName"
      />
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper tw:h-full tw:grow tw:overflow-auto tw:p-6">
      <!--
        `b-overlay` avec `opacity="0"` ne servait qu'à centrer une roue de
        chargement : son voile était transparent, et le contenu qu'il
        recouvrait n'était de toute façon pas rendu (`v-if="!loading"`).
      -->
      <div v-if="loading" class="tw:flex tw:h-full tw:items-center tw:justify-center">
        <Spinner size="lg" />
      </div>
      <template v-else>
        <data-not-found v-if="dataNotFound" class="tw:mt-3" />
        <router-view
          @start-init="viewIsInitializing = true"
          @end-init="viewIsInitializing = false"
        />
      </template>
    </div>
  </Multipane>
</template>
<script>
import { mapState } from 'pinia';
import { Multipane, MultipaneResizer } from 'vue-multipane';

import { Spinner } from '@/components/ui/spinner';
import { useAuthStore, useStorageIndexStore } from '@/stores';
import { setPersistedItem, getPersistedItem } from './itemsStorage';

import Treeview from '@/components/Data/Leftnav/Treeview.vue';
import DataNotFound from './Data404.vue';

export default {
  name: 'DataLayout',
  components: {
    DataNotFound,
    Multipane,
    MultipaneResizer,
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
    this.paneSize = `${getPersistedItem('paneSize')}px`;
  },
  methods: {
    saveNewPaneSize(size) {
      setPersistedItem('paneSize', size.scrollWidth);
      this.paneSize = `${getPersistedItem('paneSize')}px`;
    },
    async fetchIndexList() {
      try {
        await this.storageIndexStore.fetchIndexList();
      } catch (error) {
        this.$log.error(error);
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while fetching the indexes list.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
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
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while fetching the collection list.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
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
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while fetching the collection mapping.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
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

<style lang="scss" scoped>
/*
 * Ce qui reste ici appartient à `vue-multipane` : la poignée est un nœud que
 * la bibliothèque rend elle-même, sous sa propre classe, et sur laquelle nous
 * ne pouvons pas poser d'utilitaire. Ce bloc s'en va avec elle (§ 3.1) ; ses
 * couleurs passent en attendant par les tokens.
 */
.Custom-resizer > .multipane-resizer {
  margin: 0;
  left: 0;
  position: relative;
  padding: 3px;
  border: 1px solid var(--border);
  box-shadow: 2px 0 5px -2px rgb(0 0 0 / 30%);
  &:before {
    display: block;
    content: '';
    width: 1px;
    height: 50px;
    position: absolute;
    top: 45%;
    left: 50%;
    border-left: 1px solid var(--muted-foreground);
  }
  &:hover {
    &:before {
      border-color: var(--foreground);
      background-color: var(--muted);
    }
  }
}
</style>
