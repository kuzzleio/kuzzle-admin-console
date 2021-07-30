<template lang="html">
  <div class="PageNotAllowed">
    <b-jumbotron header="Sorry" lead="You are not allowed to access this page">
      <em
        >Learn more about security &amp; permissions on
        <a
          href="https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/#user-permissions"
          target="_blank"
          >Kuzzle guide</a
        ></em
      >
    </b-jumbotron>
  </div>
</template>

<style lang="scss" scoped>
.PageNotAllowed {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>

<script>
export default {
  name: 'PageNotAllowed',
  components: {}
} ;
</script>
