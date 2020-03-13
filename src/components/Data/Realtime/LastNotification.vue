<template>
  <b-card id="lastNotification-container" class="card-panel col s4">
    <template v-slot:header>Latest notification</template>
    <div class="lastNotification-body">
      <p
        v-json-formatter="{
          content: {
            id: lastNotification.source.id,
            body: lastNotification.source.body,
            meta: lastNotification.source.meta,
            volatile: lastNotification.source.volatile
          },
          open: true
        }"
      />
    </div>
  </b-card>
</template>

<script>
import JsonFormatter from '../../../directives/json-formatter.directive'

export default {
  name: 'LastNotification',
  directives: {
    JsonFormatter
  },
  props: ['lastNotification']
}
</script>

<style rel="stylesheet/scss" lang="scss">
#lastNotification-container {
  margin-left: 10px;
  margin-top: 0px;
  height: 412px;

  .lastNotification-body {
    height: 348px;
    overflow-y: auto;
  }
}
</style>
