<template>
  <ul class="indexes">
    <li v-for="(key, index) in tree" v-bind:class="{ 'open': openBranches[key]}">
      <i v-if="collectionCount(index)" class="fa fa-caret-right tree-toggle" aria-hidden="true" @click="toggleBranch(key)"></i>
      <!-- v-link="{name: 'DataIndex', params: {index: index.name}}" -->
      <a class="tree-item truncate"
         v-bind:class="{ 'active': $route.params.index == index.name && !$route.params.collection }">
        <i class="fa fa-database" aria-hidden="true"></i>
        <strong>{{index.name}}</strong> ({{collectionCount(index)}})
      </a>
      <ul class="collections">
        <li v-for="collection in index.collections.stored">
          <a class="tree-item truncate"
             v-link="{name: 'DataIndexCollection', params: {index: index.name, collection: collection}}"
             v-bind:class="{ 'active': $route.params.collection == collection }">
             <i class="fa fa-th-list" aria-hidden="true" title="Persisted collection"></i>
             {{collection}}
           </a>
        </li>
        <li v-for="collection in index.collections.realtime">
          <a class="tree-item truncate">
            <i class="fa fa-bolt" aria-hidden="true" title="Volatile collection"></i>
            {{collection}}
          </a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
  import Vue from 'vue'

  export default {
    props: ['tree'],
    data () {
      return {
        openBranches: []
      }
    },
    methods: {
      toggleBranch (index) {
        Vue.set(this.openBranches, index, !this.openBranches[index])
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
      }
    }
  }
</script>

<style scoped>
ul,
li
{
    padding: 0;
    margin: 0;
    list-style: none;
}

ul.indexes
{
  margin-top: 16px;
  padding-left: 15px;
}

ul.collections
{
  padding-left: 15px;
  overflow-y: hidden;
  max-height: 0;
}

ul.indexes li
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

ul.indexes li.open i.tree-toggle
{
  transform: rotate(90deg);
}

ul.indexes li.open ul.collections
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
