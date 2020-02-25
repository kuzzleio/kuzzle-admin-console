<template>
  <div :class="{ open: open || filter }" class="index-branch mt-2">
    <i
      v-if="collectionCount"
      class="fa fa-caret-right tree-toggle"
      aria-hidden="true"
      @click="toggleBranch"
    />
    <i v-else class="no-caret"></i>
    <router-link
      data-cy="Treeview-item"
      class="tree-item truncate mt-2"
      :class="{ active: isIndexActive(indexName) }"
      :title="indexName"
      :to="{ name: 'Collections', params: { index: indexName } }"
    >
      <i class="fa fa-database" aria-hidden="true" />
      <span v-html="highlight(truncateName(indexName, 12), filter)" /> ({{
        collectionCount
      }})
    </router-link>
    <div class="collections">
      <div
        v-for="collectionName in orderedFilteredStoredCollections"
        class="tree-item truncate mt-2"
        data-cy="Treeview-item"
        :title="collectionName"
        :class="{ active: isCollectionActive(indexName, collectionName) }"
        :key="collectionName"
      >
        <router-link
          :to="{
            name: 'DocumentList',
            params: { index: indexName, collection: collectionName }
          }"
        >
          <i
            class="fa fa-th-list"
            aria-hidden="true"
            title="Persisted collection"
          />
          <span v-html="highlight(truncateName(collectionName, 15), filter)" />
        </router-link>
      </div>

      <div
        v-for="collectionName in orderedFilteredRealtimeCollections"
        class="tree-item"
        data-cy="Treeview-item"
        :class="{ active: isCollectionActive(indexName, collectionName) }"
        :key="collectionName"
        :to="{
          name: 'WatchCollection',
          params: { index: indexName, collection: collectionName }
        }"
      >
        <i class="fa fa-bolt" aria-hidden="true" title="Volatile collection" />
        <span v-html="highlight(truncateName(collectionName, 15), filter)" />
        <i
          class="fa fa-times right remove"
          @click.prevent="removeRealtimeCollection(indexName, collectionName)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { truncateName } from '../../../utils'

export default {
  props: {
    forceOpen: {
      type: Boolean,
      default: false
    },
    indexName: String,
    currentIndex: String,
    filter: String,
    currentCollection: String,
    routeName: String,
    collections: Object
  },
  data: function() {
    return {
      open: false
    }
  },
  computed: {
    collectionCount() {
      if (!this.collections) {
        return 0
      }

      return this.collections.realtime.length + this.collections.stored.length
    },
    orderedFilteredStoredCollections() {
      if (this.collections) {
        return this.collections.stored
          .filter(col => col.indexOf(this.filter) !== -1)
          .sort()
      }
      return []
    },
    orderedFilteredRealtimeCollections() {
      if (this.collections) {
        return this.collections.realtime
          .filter(col => col.indexOf(this.filter) !== -1)
          .sort()
      }
      return []
    }
  },
  watch: {
    currentIndex() {
      this.testOpen()
    },
    currentCollection() {
      this.testOpen()
    }
  },
  mounted() {
    this.testOpen()
  },
  methods: {
    truncateName,
    toggleBranch() {
      // TODO This state should be one day persistent across page refreshes
      this.open = !this.open
    },
    // TODO get rid of this ESTEBAAAAAAAAN
    getRelativeLink(isRealtime) {
      switch (this.routeName) {
        case 'WatchCollection':
          return this.routeName
        case 'DocumentList':
          return isRealtime ? 'WatchCollection' : this.routeName
        default:
          return 'DocumentList'
      }
    },
    testOpen() {
      if (this.currentIndex === this.indexName) {
        this.open = true
      }
    },
    isIndexActive(indexName) {
      return this.currentIndex === indexName && !this.currentCollection
    },
    isCollectionActive(indexName, collectionName) {
      return (
        this.currentIndex === indexName &&
        this.currentCollection === collectionName
      )
    },
    highlight(value, filter) {
      if (value && value !== '' && filter && filter !== '') {
        let index = value.toLowerCase().indexOf(filter.toLowerCase())

        if (index >= 0) {
          value =
            value.substring(0, index) +
            '<strong class="highlight">' +
            value.substring(index, index + filter.length) +
            '</strong>' +
            value.substring(index + filter.length)
        }
      }

      return value
    },
    removeRealtimeCollection(indexName, collectionName) {
      this.$store.direct.dispatch.index.removeRealtimeCollection({
        index: indexName,
        collection: collectionName
      })
      if (
        this.$route.params.index === indexName &&
        this.$route.params.collection === collectionName
      ) {
        this.$router.push({
          name: 'Indexes',
          params: { index: indexName }
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.collections {
  padding-left: 25px;
  overflow-y: hidden;
  max-height: 0;
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

.tree-toggle {
  cursor: pointer;
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
