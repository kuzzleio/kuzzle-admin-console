<template>
  <div :class="{ 'open': open }">
    <i v-if="collectionCount(index)" class="fa fa-caret-right tree-toggle" aria-hidden="true" @click="toggleBranch()"></i>
    <a v-link="{name: 'DataIndexSummary', params: {index: index.name}}" class="tree-item truncate"
       :class="{ 'active': isIndexActive($route, index.name) }">
      <i class="fa fa-database" aria-hidden="true"></i>
      <strong>{{index.name}}</strong> ({{collectionCount(index)}})
    </a>
    <ul class="collections">
      <li v-for="collection in index.collections.stored">
        <a class="tree-item truncate"
           v-link="{name: 'DataCollectionBrowse', params: {index: index.name, collection: collection}}"
           :class="{ 'active': isCollectionActive($route, collection) }">
           <i class="fa fa-th-list" aria-hidden="true" title="Persisted collection"></i>
           {{collection}}
         </a>
      </li>
      <li v-for="collection in index.collections.realtime">
        <a class="tree-item truncate"
           v-link="{name: 'DataCollectionBrowse', params: {index: index.name, collection: collection}}"
           :class="{ 'active': isCollectionActive($route, collection) }">
          <i class="fa fa-bolt" aria-hidden="true" title="Volatile collection"></i>
          {{collection}}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['index'],
  data: function () {
    return {
      open: false
    }
  },
  methods: {
    toggleBranch () {
      // TODO This state should be one day persistent across page refreshes
      this.open = !this.open
    },
    collectionCount (index) {
      let count = 0

      if (!index.collections) {
        return 0
      }

      if (index.collections.stored) {
        count += index.collections.stored.length
      }

      if (index.collections.realtime) {
        count += index.collections.realtime.length
      }

      return count
    },
    isIndexActive (routeObject, indexName) {
      return routeObject &&
             routeObject.params &&
             routeObject.params.index === indexName &&
             !routeObject.params.collection
    },
    isCollectionActive (routeObject, collectionName) {
      return routeObject &&
             routeObject.params &&
             routeObject.params.collection === collectionName
    }
  },
  ready: function () {
    if (this.$route.params && this.$route.params.index === this.index.name) {
      this.open = true
    }
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
