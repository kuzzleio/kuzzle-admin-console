<template>
  <Multipane class="DataLayout Custom-resizer" layout="vertical">
    <div class="DataLayout-sidebarWrapper" data-cy="DataLayout-sidebarWrapper">
      <treeview
        :indexName="$route.params.indexName"
        :collectionName="$route.params.collectionName"
      />
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper">
      <template v-if="loading">
        <main-spinner></main-spinner>
      </template>
      <router-view v-else />
    </div>
  </Multipane>
</template>

<script>
import MainSpinner from '../Common/MainSpinner'
import { Multipane, MultipaneResizer } from 'vue-multipane'
import Treeview from '@/components/Data/Leftnav/Treeview'

export default {
  name: 'DataLayout',
  components: {
    MainSpinner,
    Treeview,
    Multipane,
    MultipaneResizer
  },
  data() {
    return {
      isFetching: false
    }
  },
  computed: {
    loading() {
      return (
        this.isFetching ||
        (this.$store.direct.getters.index.loadingIndexes ||
        this.$route.params.collectionName
          ? this.$store.direct.getters.index.loadingCollections(
              this.$route.params.indexName
            )
          : false)
      )
    }
  },
  methods: {
    async fetchIndexeList() {
      try {
        await this.$store.direct.dispatch.index.fetchIndexeList()
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while fetching the indexes list.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    },
    async fetchCollectionList(indexName) {
      try {
        const index = this.$store.direct.getters.index.getOneIndex(indexName)
        await this.$store.direct.dispatch.index.fetchCollectionList(index)
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while fetching the collections list.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    },
    async fetchCollectionMapping(indexName, collectionName) {
      try {
        const index = this.$store.direct.getters.index.getOneIndex(indexName)
        const collection = this.$store.direct.getters.index.getOneCollection(
          index,
          collectionName
        )

        await this.$store.direct.dispatch.index.fetchCollectionMapping({
          index,
          collection
        })
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while fetching the collection mapping.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    }
  },
  async mounted() {
    // ---- LAZY LOADING SEQUENCE ----
    //
    // The "DataLayout" component is in charge of
    // dispatching all the actions of the store that need
    // to fetch information from Kuzzle beforehand.
    //
    // 1 - Always fetch index list
    // 2 - Fetch collection list
    // 3 - Fetch collection mapping
    //
    // Each action is conditioned by the parameters coming from the router.

    this.isFetching = true

    await this.fetchIndexeList()

    if (this.$route.params.indexName) {
      await this.fetchCollectionList(this.$route.params.indexName)
    }

    if (this.$route.params.indexName && this.$route.params.collectionName) {
      await this.fetchCollectionMapping(
        this.$route.params.indexName,
        this.$route.params.collectionName
      )
    }

    this.isFetching = false
  }
}
</script>

<style lang="scss" scoped>
.DataLayout {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
.DataLayout-sidebarWrapper {
  background-color: $light-grey-color;
  min-width: $sidebar-width;
  width: $sidebar-width;
  height: 100%;
  overflow: auto;
  z-index: 1;
}

.DataLayout-contentWrapper {
  position: unset;
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: $content-gutter;
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
