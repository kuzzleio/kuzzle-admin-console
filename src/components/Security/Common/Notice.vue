<template functional>
  <b-alert show>
    For more information about security policies please visit
    <a
      class="blue-text lighten-2"
      href="https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/"
      target="_blank"
      >https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/
      <i class="fa fa-external-link-alt"
    /></a>
  </b-alert>
</template>

<script>
export default {
  name: 'SecurityNotice',
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@use '@/assets/styles/variables.scss';

.SecurityNotice {
  max-width: variables.$container-width;
}
</style>
