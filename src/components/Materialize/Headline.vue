<template>
  <div class="headline">
    <h1>
      <slot>{{title}}</slot>
    </h1>

    <breadcrumb></breadcrumb>
  </div>
</template>

<script>
  import Breadcrumb from '../Common/Breadcrumb'

  export default {
    name: 'headline',
    props: {
      title: String
    },
    components: {
      Breadcrumb
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .headline {
    margin-bottom: 30px;
    a.btn {
      margin-top: 5px;
      margin-left: 15px;
    }
    h1 {
      margin-bottom: 0;
    }
  }
</style>