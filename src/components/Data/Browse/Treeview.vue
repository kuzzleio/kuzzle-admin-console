<template>
  <ul class="indexes">
    <li v-for="(key, indexTree) in tree | orderBy 'name'">
      <index-branch
        :route-name="routeName"
        :index-tree="indexTree"
        :index="index"
        :collection="collection">
      </index-branch>
    </li>
  </ul>
</template>

<script>
  import IndexBranch from './IndexBranch'

  export default {
    name: 'Treeview',
    props: {
      index: String,
      collection: String,
      routeName: String,
      tree: Array
    },
    components: {
      IndexBranch
    }
  }
</script>

<style scoped>
.indexes
{
  margin-top: 16px;
  padding-left: 15px;
  list-style: none;
}

li
{
  position: relative;
}
</style>
