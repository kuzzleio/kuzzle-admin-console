<template>
  <div class="CreateFirstAdminHeader">
    <span><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> <b>Warning!</b> Your Kuzzle has no administrator user. It is strongly recommended
    <router-link :to="{name: 'Signup'}"> that you create one.</router-link></span> <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
</template>

<style lang="scss" scoped>
.CreateFirstAdminHeader {
  line-height: 2.5em;
  background-color: #0397ef;
  color: #fff;
  text-align: center;

  a {
    color: #fff;
    text-decoration: underline;
  }
}
</style>
