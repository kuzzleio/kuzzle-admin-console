<template functional>
  <b-alert show>
    For more information about securities policies please visit
    <a
      class="blue-text lighten-2"
      href="https://docs.kuzzle.io/core/2/guides/essentials/security/"
      target="_blank"
      >https://docs.kuzzle.io/core/2/guides/essentials/security
      <i class="fa fa-external-link-alt"
    /></a>
  </b-alert>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.SecurityNotice {
  max-width: $container-width;
}
</style>

<script>
export default {
  name: 'SecurityNotice'
}
</script>
