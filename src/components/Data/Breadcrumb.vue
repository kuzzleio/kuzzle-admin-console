<template>
  <nav class="subnav">
    <ul>
      <li>
        DataBreadcrumb
      </li>
      <li v-link-active>
        <!--<a v-link="{name: 'SummaryData', activeClass: 'active'}">Summary</a>-->
      </li>
    </ul>
  </nav>

</template>

<style lang="scss" scoped>
  .subnav {
    position: fixed;
    z-index: 100;
    top: 50px;
  }
</style>

<script>
  export default {
    name: 'DataBreadcrumb'
  }
</script>
