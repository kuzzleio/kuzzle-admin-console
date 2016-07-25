<template>
  <ul class="indexes">
    <li v-for="(key, index) in tree">
      <index-branch v-bind:index="index"></index-branch>
    </li>
  </ul>
</template>

<script>
  import IndexBranch from './IndexBranch'

  export default {
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
  padding: 0;
  margin: 0;
  list-style: none;
}

li
{
  position: relative;
}
</style>
