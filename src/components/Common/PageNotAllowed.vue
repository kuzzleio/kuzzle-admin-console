<template lang="html">
  <div class="wrapper">
    <headline title="Sorry, dude..."></headline>
    <div class="card-panel">
      <div class="row valign-bottom empty-set empty-set-condensed">
        <div class="col s1 offset-s1">
          <i class="fa fa-6x fa-lock grey-text text-lighten-1" aria-hidden="true"></i>
        </div>
        <div class="col s10">
          <p>
            You are not allowed to access this page<br>
          </p>
          <p>
            <em>Learn more about security &amp; permissions on <a href="http://docs.kuzzle.io/guide/#security" target="_blank">Kuzzle guide</a></em>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Headline from '../Materialize/Headline'

  export default {
    name: 'PageNotAllowed',
    components: {
      Headline
    }
  }
</script>
