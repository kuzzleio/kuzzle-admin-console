<template>
  <div class="IndexBranch tw:mt-2 tw:overflow-hidden tw:whitespace-nowrap">
    <!--
      Le chevron était un `<i>` cliquable : invisible au clavier, et muet pour
      un lecteur d'écran. C'est un bouton, et il annonce l'état de la branche.
    -->
    <Button
      :aria-expanded="open ? 'true' : 'false'"
      :aria-label="`Collections of index ${index.name}`"
      class="tw:size-5 tw:align-middle"
      :data-cy="`IndexBranch-toggle--${index.name}`"
      size="icon"
      variant="ghost"
      @click="onToggleBranchClicked"
    >
      <i
        aria-hidden="true"
        class="fa fa-caret-right tw:text-muted-foreground tw:transition-transform tw:duration-200"
        :class="{ 'tw:rotate-90': open }"
      />
    </Button>
    <router-link
      class="tw:mx-1 tw:truncate tw:px-1 tw:text-foreground"
      :data-cy="`Treeview-item-index-link--${index.name}`"
      :class="{ 'tw:font-bold': isIndexActive(index.name) }"
      :title="index.name"
      :to="{ name: 'Collections', params: { indexName: index.name } }"
    >
      <i class="fa fa-database tw:mr-1 tw:text-muted-foreground" aria-hidden="true" />
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
      class="tw:grid tw:pl-6 tw:transition-[grid-template-rows] tw:duration-500 tw:ease-out"
      :class="open ? 'tw:grid-rows-[1fr]' : 'tw:grid-rows-[0fr]'"
    >
      <div class="tw:overflow-hidden">
        <template v-if="orderedFilteredCollections.length">
          <div
            v-for="collection in orderedFilteredCollections"
            :key="`${collection.name}-${collection.type}`"
            class="tw:mx-1 tw:mt-2 tw:truncate tw:px-1 tw:text-foreground"
            :class="{
              'tw:font-bold': isCollectionActive(index.name, collection.name),
            }"
            :data-cy="`Treeview-item--${collection.name}`"
            :title="collection.name"
          >
            <template v-if="collection.isRealtime()">
              <i
                class="fa fa-bolt tw:mr-2 tw:ml-1 tw:text-muted-foreground"
                aria-hidden="true"
                title="Volatile collection"
              />
              <router-link
                class="tw:text-foreground"
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
                class="fa fa-th-list tw:mr-1 tw:text-muted-foreground"
                aria-hidden="true"
                title="Persisted collection"
              />
              <router-link
                class="tw:text-foreground"
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
        <template v-else><span class="tw:text-muted-foreground">no collections</span></template>
        <Button
          v-if="showMoreCollectionsDisplay"
          class="tw:mx-1 tw:h-auto tw:px-1"
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
<script>
import { mapActions, mapState } from 'pinia';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useStorageIndexStore } from '@/stores';
import { truncateName } from '@/utils';

import HighlightedSpan from '@/components/Common/HighlightedSpan.vue';

export default {
  components: {
    Button,
    HighlightedSpan,
    Spinner,
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
    ...mapState(useStorageIndexStore, ['loadingCollections']),
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

      if (this.filter === '') {
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
    ...mapActions(useStorageIndexStore, ['fetchCollectionList']),
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
  },
};
</script>
