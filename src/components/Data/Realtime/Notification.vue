<template>
  <div class="collapsible-header unselectable" :class="notification.class" @click="toggleCollapse">
    <i :class="{'fa-caret-right': collapsed, 'fa-caret-down': !collapsed}" class="fa"></i>
    <i class="fa fa-{{notification.icon}}"></i> {{notification.text}} - {{ago}}
  </div>
  <div class="collapsible-body" v-if="notification.source">
    <p v-json-formatter="notification.source"></p>
  </div>
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
    color: #2A2A2A;
    border-width: 0;
  }

  .collapsible-body p {
    padding-top: 0;
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
    props: [
      'notification'
    ],
    directives: {
      JsonFormatter
    },
    data () {
      return {
        ago: moment(this.notification.timestamp).fromNow(),
        collapsed: true
      }
    },
    methods: {
      toggleCollapse: function () {
        this.collapsed = !this.collapsed
      }
    },
    ready () {
      setInterval(() => {
        this.ago = moment(this.notification.timestamp).fromNow()
      }, 60000)
    }
  }
</script>
