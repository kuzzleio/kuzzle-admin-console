<template>
  <ul class="indexes">
    <li v-for="(key, index) in tree | orderBy 'name'">
      <index-branch :index="index"></index-branch>
    </li>
  </ul>
</template>

<script>
  import IndexBranch from './IndexBranch'

  export default {
    name: 'Treeview',
    props: ['tree'],
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
