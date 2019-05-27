<template>
  <li class="Notification">
    <div class="Notification--header collapsible-header unselectable" :class="notification.class" @click="toggleCollapse">
      <i :class="{'fa-caret-right': collapsed, 'fa-caret-down': !collapsed}" class="fa"></i>
      <i class="fa" :class="notificationIcon"></i> {{notification.text}} - {{ago}}
    </div>
    <div class="Notification--body collapsible-body" v-if="!notification.empty">
      <p v-json-formatter="{content: notification.source, open: true}"/>
    </div>
  </li>
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
  name: 'RealtimeNotification',
  props: ['notification'],
  directives: {
    JsonFormatter
  },
  data() {
    return {
      ago: moment(this.notification.timestamp).fromNow(),
      collapsed: true
    }
  },
  methods: {
    toggleCollapse: function() {
      this.collapsed = !this.collapsed
    }
  },
  computed: {
    notificationIcon() {
      return `fa-${this.notification.icon}`
    }
  },
  mounted() {
    setInterval(() => {
      this.ago = moment(this.notification.timestamp).fromNow()
    }, 60000)
  }
}
</script>
