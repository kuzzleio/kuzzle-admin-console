<template>
  <Multipane
    class="DataLayout Custom-resizer"
    layout="vertical"
    @paneResizeStop="saveNewPaneSize($event)"
  >
    <div
      class="DataLayout-sidebarWrapper"
      :style="{ width: paneSize }"
      data-cy="DataLayout-sidebarWrapper"
    >
      <treeview
        :index-name="$route.params.indexName"
        :collection-name="$route.params.collectionName"
      />
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper">
      <b-overlay :show="loading" opacity="0" class="h-100">
        <data-not-found v-if="!loading && dataNotFound" class="mt-3" />
        <router-view
          v-if="!loading"
          @start-init="viewIsInitializing = true"
          @end-init="viewIsInitializing = false"
        />
      </b-overlay>
    </div>
  </Multipane>
</template>

<script>
import { mapState } from 'pinia';
import { Multipane, MultipaneResizer } from 'vue-multipane';

import { useAuthStore, useStorageIndexStore } from '@/stores';
import { setPersistedItem, getPersistedItem } from './itemsStorage';

import Treeview from '@/components/Data/Leftnav/Treeview.vue';
import DataNotFound from './Data404.vue';

export default {
  name: 'DataLayout',
  components: {
    Treeview,
    Multipane,
    MultipaneResizer,
    DataNotFound,
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
@use '@/assets/styles/variables.scss';

.DataLayout {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.DataLayout-sidebarWrapper {
  background-color: variables.$light-grey-color;
  min-width: variables.$sidebar-width;
  height: 100%;
  overflow: auto;
  z-index: 1;
}

.DataLayout-contentWrapper {
  position: unset;
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: variables.$content-gutter;
}

.Custom-resizer > .multipane-resizer {
  margin: 0;
  left: 0;
  position: relative;
  padding: 3px;
  border: 1px solid #ccc;
  box-shadow: 2px 0px 5px -2px rgba(112, 112, 112, 1);
  &:before {
    display: block;
    content: '';
    width: 1px;
    height: 50px;
    position: absolute;
    top: 45%;
    left: 50%;
    border-left: 1px solid #aaa;
  }
  &:hover {
    &:before {
      border-color: #777;
      background-color: #f5f5f5;
    }
  }
}
</style>
