<template>
  <div :class="{ open: open || filter }" class="index-branch">
    <i
      v-if="collectionCount"
      class="fa fa-caret-right tree-toggle"
      aria-hidden="true"
      @click="toggleBranch"
    />
    <router-link
      :to="{ name: 'DataIndexSummary', params: { index: indexName } }"
      class="tree-item truncate"
      :class="{ active: isIndexActive(indexName) }"
    >
      <i class="fa fa-database" aria-hidden="true" />
      <span v-html="highlight(indexName, filter)" /> ({{ collectionCount }})
    </router-link>
    <ul class="collections">
      <li
        v-for="collectionName in orderedFilteredStoredCollections"
        :key="collectionName"
      >
        <router-link
          class="tree-item truncate"
          :to="{
            name: 'DataDocumentsList',
            params: { index: indexName, collection: collectionName }
          }"
          :class="{ active: isCollectionActive(indexName, collectionName) }"
        >
          <i
            class="fa fa-th-list"
            aria-hidden="true"
            title="Persisted collection"
          />
          <span v-html="highlight(collectionName, filter)" />
        </router-link>
      </li>
      <li
        v-for="collectionName in orderedFilteredRealtimeCollections"
        :key="collectionName"
      >
        <router-link
          class="tree-item"
          :to="{
            name: 'DataCollectionWatch',
            params: { index: indexName, collection: collectionName }
          }"
          :class="{ active: isCollectionActive(indexName, collectionName) }"
        >
          <i
            class="fa fa-bolt"
            aria-hidden="true"
            title="Volatile collection"
          />
          <span v-html="highlight(collectionName, filter)" />
          <i
            class="fa fa-times right remove"
            @click.prevent="removeRealtimeCollection(indexName, collectionName)"
          />
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
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
    toggleBranch() {
      // TODO This state should be one day persistent across page refreshes
      this.open = !this.open
    },
    getRelativeLink(isRealtime) {
      switch (this.routeName) {
        case 'DataCollectionWatch':
          return this.routeName
        case 'DataDocumentsList':
          return isRealtime ? 'DataCollectionWatch' : this.routeName
        default:
          return 'DataDocumentsList'
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
      this.$store.dispatch.index.removeRealtimeCollection({
        index: indexName,
        collection: collectionName
      })
      if (
        this.$route.params.index === indexName &&
        this.$route.params.collection === collectionName
      ) {
        this.$router.push({
          name: 'DataIndexSummary',
          params: { index: indexName }
        })
      }
    }
  }
}
</script>

<style scoped lang="css">
ul.collections {
  padding-left: 15px;
  overflow-y: hidden;
  max-height: 0;
}

li {
  position: relative;
}

a,
i.tree-toggle {
  line-height: 32px;
  height: 32px;
}

a.tree-item {
  padding: 0 5px;
  margin: 0 15px;
}

a.tree-item.active {
  font-weight: bold;
  color: #3498db;
}

i.fa {
  margin-right: 5px;
  color: rgb(100, 100, 100);
}

i.fa:hover {
  margin-right: 5px;
  color: rgb(50, 50, 50);
}

i.tree-toggle {
  position: absolute;
  cursor: pointer;
  padding: 0 10px 0 10px;
  margin: 0 0 0 -10px;
  transition-duration: 0.2s;
  transform-origin: 50% 50%;
}

/** open-closed state **/

.open i.tree-toggle {
  transform: rotate(90deg);
}

.open ul.collections {
  max-height: 2000px;
  transition: max-height 0.5s ease-out;
}

/* webkit adjacent element selector bugfix */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .treeview {
    -webkit-animation: webkit-adjacent-element-selector-bugfix infinite 1s;
  }

  @-webkit-keyframes webkit-adjacent-element-selector-bugfix {
    from {
      padding: 0;
    }
    to {
      padding: 0;
    }
  }
}
</style>
