<template>
  <div class="Headline">
    <h2>
      <slot>{{ title }}</slot>
    </h2>
    <breadcrumb />
  </div>
</template>

<script>
import Breadcrumb from '@/components/Common/Breadcrumb.vue'

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
@use '@/assets/styles/variables.scss';

.Headline {
  color: variables.$primary-color;

  h1 {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 3rem;
  }
}
</style>
