<template>
  <div id="lastNotification-container" class="card-panel col s4">
    <h5>Latest document :</h5>
    <div class="lastNotification-body">
      <p
        v-json-formatter="{
          content: {
            id: lastNotification.source.id,
            body: lastNotification.source.body,
            meta: lastNotification.source.meta,
            volatile: lastNotification.source.volatile,
          },
          open: true
        }"
      />
    </div>
  </div>
</template>


<script>
  import JsonFormatter from '../../../directives/json-formatter.directive'

  export default {
    name: 'LastNotification',
    props: [
      'lastNotification'
    ],
    directives: {
      JsonFormatter
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  #lastNotification-container {
    margin-left: 10px;
    margin-top: 0px;
    height: 412px;
    .lastNotification-body {
      height:348px;
      overflow-y: auto;
    }
  }
</style>

