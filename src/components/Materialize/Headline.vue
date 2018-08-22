<template>
  <div class="Headline">
    <h1>
      <slot>{{title}}</slot>
    </h1>

    <breadcrumb></breadcrumb>
  </div>
</template>

<script>
import Breadcrumb from '../Common/Breadcrumb'

export default {
  name: 'eadline',
  props: {
    title: String
  },
  components: {
    Breadcrumb
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.Headline {
  margin-bottom: 30px;

  h1 {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 3rem;
  }
}
</style>
