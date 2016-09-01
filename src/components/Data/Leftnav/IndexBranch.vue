<template>
  <div :class="{ 'open': open || filter }">
    <i v-if="collectionCount" class="fa fa-caret-right tree-toggle" aria-hidden="true" @click="toggleBranch"></i>
    <a v-link="{name: 'DataIndexSummary', params: {index: indexName}}" class="tree-item truncate"
       :class="{ 'active': isIndexActive(indexName) }">
      <i class="fa fa-database" aria-hidden="true"></i>
      {{{indexName | highlight filter}}} ({{collectionCount}})
    </a>
    <ul class="collections">
      <li v-for="collectionName in collections.stored | orderBy 1 | filterBy filter">
        <a class="tree-item truncate"
           v-link="{name: 'DataDocumentsList', params: {index: indexName, collection: collectionName}}"
           :class="{ 'active': isCollectionActive(indexName, collectionName) }">
           <i class="fa fa-th-list" aria-hidden="true" title="Persisted collection"></i>
           {{{collectionName | highlight filter}}}
         </a>
      </li>
      <li v-for="collectionName in collections.realtime | orderBy 1 | filterBy filter">
        <a class="tree-item truncate"
           v-link="{name: 'DataCollectionWatch', params: {index: indexName, collection: collectionName}}"
           :class="{ 'active': isCollectionActive(indexName, collectionName) }">
          <i class="fa fa-bolt" aria-hidden="true" title="Volatile collection"></i>
          {{{collectionName | highlight filter}}}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { highlight } from '../../../filters/highlight.filter'

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
  data: function () {
    return {
      open: false
    }
  },
  filters: {
    highlight
  },
  computed: {
    collectionCount () {
      if (!this.collections) {
        return 0
      }

      return this.collections.realtime.length + this.collections.stored.length
    }
  },
  methods: {
    toggleBranch () {
      // TODO This state should be one day persistent across page refreshes
      this.open = !this.open
    },
    getRelativeLink (isRealtime) {
      switch (this.routeName) {
        case 'DataCollectionWatch':
          return this.routeName
        case 'DataDocumentsList':
          return isRealtime ? 'DataCollectionWatch' : this.routeName
        default:
          return 'DataDocumentsList'
      }
    },
    testOpen () {
      if (this.currentIndex === this.indexName) {
        this.open = true
      }
    },
    isIndexActive (indexName) {
      return this.currentIndex === indexName && !this.currentCollection
    },
    isCollectionActive (indexName, collectionName) {
      return this.currentIndex === indexName && this.currentCollection === collectionName
    }
  },
  watch: {
    currentIndex () {
      this.testOpen()
    },
    currentCollection () {
      this.testOpen()
    }
  },
  ready () {
    this.testOpen()
  }
}
</script>

<style scoped lang="css">
ul.collections
{
  padding-left: 15px;
  overflow-y: hidden;
  max-height: 0;
}

li
{
  position: relative;
}

a,
i.tree-toggle
{
  line-height: 32px;
  height: 32px;
}

a.tree-item
{
  padding: 0 5px;
  margin: 0 15px;
}

a.tree-item.active
{
  font-weight: bold;
  color: #d54f58;
}

i.fa
{
  margin-right: 5px;
  color: rgb(100, 100, 100);
}

i.fa:hover
{
  margin-right: 5px;
  color: rgb(50, 50, 50);
}

i.tree-toggle
{
  position: absolute;
  cursor: pointer;
  padding: 0 10px 0 10px;
  margin: 0 0 0 -10px;
  transition-duration: .2s;
  transform-origin: 50% 50%;
}

/** open-closed state **/

.open i.tree-toggle
{
  transform: rotate(90deg);
}

.open ul.collections
{
  max-height: 2000px;
  transition: max-height 0.5s ease-out;
}

/* webkit adjacent element selector bugfix */
@media screen and (-webkit-min-device-pixel-ratio:0)
{
    .treeview
    {
        -webkit-animation: webkit-adjacent-element-selector-bugfix infinite 1s;
    }

    @-webkit-keyframes webkit-adjacent-element-selector-bugfix
    {
        from
        {
            padding: 0;
        }
        to
        {
            padding: 0;
        }
    }
}
</style>
