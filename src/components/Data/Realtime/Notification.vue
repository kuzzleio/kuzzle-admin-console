<template>
  <b-card no-body class="Notification">
    <b-card-header @click="collapsed = !collapsed">
      <i
        :class="{ 'fa-caret-right': !collapsed, 'fa-caret-down': collapsed }"
        class="fa"
      />
      <i class="fa" :class="notificationIcon" /> {{ notification.text }}
      <span class="text-secondary"> - {{ time }}</span>
    </b-card-header>
    <b-collapse v-model="collapsed" class="p-3">
      <p v-json-formatter="{ content: notification.source, open: true }" />
    </b-collapse>
  </b-card>
</template>

<style type="text/css" media="screen" scoped>
.collapsible-header {
  border-width: 0;
}

.collapsible-header i {
  font-size: 1rem;
  width: 1rem;
}

.collapsible-body {
  color: #2a2a2a;
  border-width: 0;
}

.collapsible-body p {
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-top: solid 1px rgba(0, 0, 0, 0.1);
  border-bottom: solid 1px rgba(0, 0, 0, 0.1);
}

.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>

<script>
import JsonFormatter from '../../../directives/json-formatter.directive'
var moment = require('moment')

export default {
  name: 'Notification',
  directives: {
    JsonFormatter
  },
  props: ['notification'],
  data() {
    return {
      collapsed: false
    }
  },
  computed: {
    notificationIcon() {
      return `fa-${this.notification.icon}`
    },
    time() {
      return moment(this.notification.source.meta.createdAt).format('H:mm:ss')
    }
  }
}
</script>
