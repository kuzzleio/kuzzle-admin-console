<template>
  <div class="Headline">
    <h2>
      <slot>{{ title }}</slot>
    </h2>
    <breadcrumb />
  </div>
</template>

<script>
import Breadcrumb from '../Common/Breadcrumb'

export default {
  name: 'Headline',
  components: {
    Breadcrumb
  },
  props: {
    title: String
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.Headline {
  margin-bottom: 30px;
  color: $primary-color;

  h1 {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 3rem;
  }
}
</style>
