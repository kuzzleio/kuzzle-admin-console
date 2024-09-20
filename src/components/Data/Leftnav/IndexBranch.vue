<template>
  <div :class="{ open }" class="IndexBranch mt-2">
    <i
      aria-hidden="true"
      class="fa fa-caret-right pointer tree-toggle"
      :data-cy="`IndexBranch-toggle--${index.name}`"
      @click="onToggleBranchClicked"
    />
    <router-link
      class="tree-item truncate mt-2"
      :data-cy="`Treeview-item-index-link--${index.name}`"
      :class="{ active: isIndexActive(index.name) }"
      :title="index.name"
      :to="{ name: 'Collections', params: { indexName: index.name } }"
    >
      <i class="fa fa-database" aria-hidden="true" />
      <HighlightedSpan :value="index.name" :filter="filter" />

      <template v-if="index.collectionsCount !== undefined"
        >&nbsp;({{ index.collectionsCount }})</template
      >
    </router-link>
    <b-spinner v-if="isLoading" small />
    <div v-if="collectionsFetched" class="collections">
      <template v-if="orderedFilteredCollections.length">
        <div
          v-for="collection in orderedFilteredCollections"
          :key="`${collection.name}-${collection.type}`"
          class="tree-item truncate mt-2"
          :class="{ active: isCollectionActive(index.name, collection.name) }"
          :data-cy="`Treeview-item--${collection.name}`"
          :title="collection.name"
        >
          <template v-if="collection.isRealtime()">
            <i class="fa fa-bolt ml-1 mr-2" aria-hidden="true" title="Volatile collection" />
            <router-link
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
            <i class="fa fa-th-list" aria-hidden="true" title="Persisted collection" />
            <router-link
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
      <template v-else><span class="text-muted">no collections</span></template>
      <b-link
        v-if="showMoreCollectionsDisplay"
        class="tree-item truncate"
        @click="toggleShowMoreCollections"
      >
        <u v-if="!showMoreCollections">Show More</u>
        <u v-else>Show only results</u>
      </b-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { truncateName } from '@/utils';

import HighlightedSpan from '@/components/Common/HighlightedSpan.vue';

export default {
  components: {
    HighlightedSpan,
  },
  props: {
    forceOpen: {
      type: Boolean,
      default: false,
    },
    index: Object,
    browsedIndexName: String,
    browsedCollectionName: String,
    filter: String,
    routeName: String,
  },
  data: function () {
    return {
      open: false,
      showMoreCollections: false,
      collectionsFetched: false,
      isLoading: false,
    };
  },
  computed: {
    ...mapGetters('index', ['loadingCollections']),
    showMoreCollectionsDisplay() {
      if (
        this.filter.length > 0 &&
        this.index.collections &&
        this.index.collections.filter((col) => col.name.indexOf(this.filter) !== -1).length !==
          this.index.collections.length
      ) {
        return 1;
      }
      return 0;
    },
    orderedFilteredCollections() {
      if (!this.index.collections) {
        return [];
      }

      return this.index.collections
        .filter((col) => col.name.indexOf(this.filter) !== -1 || this.showMoreCollections)
        .sort();
    },
  },
  watch: {
    browsedIndexName() {
      this.testOpen();
    },
    browsedCollectionName() {
      this.testOpen();
    },
    filter() {
      if (
        this.index.collections &&
        this.index.collections.filter((col) => col.name.indexOf(this.filter) !== -1).length > 0
      ) {
        this.open = true;
      }

      if (this.filter == '') {
        this.open = false;
      }
    },
  },
  async mounted() {
    if (this.index) {
      await this.testOpen();
    }
  },
  methods: {
    ...mapActions('index', ['fetchCollectionList']),
    truncateName,
    async onToggleBranchClicked() {
      if (!this.open) {
        await this.fetchCollections();
      }
      this.toggleBranch();
    },
    async fetchCollections() {
      try {
        this.isLoading = true;
        await this.fetchCollectionList(this.index);
        this.collectionsFetched = true;
      } catch (error) {
        this.$log.error(error);
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while fetching the collections.',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
      }
      this.isLoading = false;
    },
    toggleBranch() {
      // TODO This state should be one day persistent across page refreshes
      // NJE edit: not today...
      this.open = !this.open;
    },
    // TODO get rid of this ESTEBAAAAAAAAN
    getRelativeLink(isRealtime) {
      switch (this.routeName) {
        case 'WatchCollection':
          return this.routeName;
        case 'DocumentList':
          return isRealtime ? 'WatchCollection' : this.routeName;
        default:
          return 'DocumentList';
      }
    },
    toggleShowMoreCollections() {
      this.showMoreCollections = !this.showMoreCollections;
    },
    async testOpen() {
      if (this.browsedIndexName === this.index.name) {
        await this.fetchCollections();
        this.open = true;
      }
    },
    isIndexActive(indexName) {
      return this.browsedIndexName === indexName && !this.browsedCollectionName;
    },
    isCollectionActive(indexName, collectionName) {
      return this.browsedIndexName === indexName && this.browsedCollectionName === collectionName;
    },
    removeRealtimeCollection(indexName, collectionName) {
      this.$store.direct.dispatch.index.removeRealtimeCollection({
        index: indexName,
        collection: collectionName,
      });
      if (
        this.$route.params.index === indexName &&
        this.$route.params.collection === collectionName
      ) {
        this.$router.push({
          name: 'Indexes',
          params: { index: indexName },
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.IndexBranch {
  white-space: nowrap;
  overflow-y: hidden;
  overflow-x: hidden;
}

.collections {
  padding-left: 25px;
  overflow-y: hidden;
  max-height: 0;
  overflow: hidden;
}

.open .collections {
  max-height: 2000px;
  transition: max-height 0.5s ease-out;
}

a {
  color: #002835;
}

.tree-item {
  padding: 0 5px;
  margin: 0 5px;
  color: #002835;
  &.active {
    font-weight: bold;
  }
}

.fa {
  margin-right: 5px;
  color: rgb(100, 100, 100);
  &:hover {
    margin-right: 5px;
    color: rgb(50, 50, 50);
  }
}

.pointer {
  cursor: pointer;
}

.tree-toggle {
  transition-duration: 0.2s;
  transform-origin: 50% 50%;
}

.open .tree-toggle {
  transform: rotate(90deg);
}

.no-caret {
  margin: 0 0.35em;
}
</style>
