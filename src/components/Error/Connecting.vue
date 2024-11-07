<template>
  <div class="row kuzzle-disconnected">
    <div class="col s12">
      <p>
        I'm doing my best to connect to the Kuzzle Server at
        <span class="host primary">{{ host }}:{{ port }}</span
        >...
      </p>
    </div>

    <div class="col s1 offset-s5">
      <div class="preloader-wrapper active valign-wrapper">
        <div class="spinner-layer">
          <div class="circle-clipper left">
            <div class="circle" />
          </div>
          <div class="gap-patch">
            <div class="circle" />
          </div>
          <div class="circle-clipper right">
            <div class="circle" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KuzzleDisconnected',
  props: {
    host: String,
    port: Number,
  },
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.kuzzle-disconnected {
  margin-top: 30px;

  .card {
    padding-bottom: 20px;
  }

  i {
    font-size: 4em;
    margin-left: 10px;
    margin-top: 10px;
    margin-right: 20px;
    float: left;
  }
  p {
    font-size: 1.3em;
    font-weight: 300;

    .host {
      font-weight: bold;
    }
    margin-bottom: 0;
  }

  .preloader-wrapper {
    margin-bottom: 0;
    margin-top: 40px;
  }
}
</style>
