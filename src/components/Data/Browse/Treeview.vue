<template>
  <ul class="indexes">
    <li v-for="(key, index) in tree" v-bind:class="{ 'open': treeState[key] }">
      <i class="fa fa-caret-right tree-toggle" aria-hidden="true" @click="toggleBranch(key)"></i>
      <a class="tree-item truncate"
         v-link="{name: 'DataIndex', params: {index: index.name}}">
        <strong><i class="fa fa-database" aria-hidden="true"></i>{{index.name}}</strong>
      </a>
      <ul class="collections">
        <li v-for="collection in index.collections.stored">
          <a class="tree-item truncate"
             v-link="{name: 'DataIndexCollection', params: {index: index.name, collection: collection}}">
             <i class="fa fa-th-list" aria-hidden="true"></i>{{collection}}
           </a>
        </li>
        <li v-for="collection in index.collections.realtime">
          <a href="#" class="truncate">{{collection}}</a>
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
        treeState: []
      }
    },
    methods: {
      toggleBranch (index) {
        Vue.set(this.treeState, index, !this.treeState[index])
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

li,
a,
i.tree-toggle
{
  line-height: 40px;
  height: 40px;
}

a.tree-item
{
  padding: 0 5px;
  margin: 0 15px;
}

i
{
  margin-right: 5px;
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
