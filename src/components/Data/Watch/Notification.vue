<template>
  <div class="collapsible-header unselectable" :class="notification.class" @click="toggleCollapse"><i v-bind:class="{'fa-caret-right': collapsed, 'fa-caret-down': !collapsed}" class="fa"></i> <i class="fa fa-{{notification.icon}}"></i> {{notification.text}} - {{ago}}</div>
  <div class="collapsible-body" v-if="notification.source"><p>{{notification.source.source}}</p></div>
</template>

<!-- header    rgba(243, 237, 211, 0.5) -->
<!-- body rgba(222, 218, 204, 0.56) -->
<style type="text/css" media="screen" scoped>

  .collapsible-header {
    #background-color: #2D2D2D;
    border-width: 0;
  }

  .collapsible-header i {
    font-size: 1rem;
    width: 1rem;
  }

  .collapsible-body {
    color: #2A2A2A;
    border-width: 0;
    #background-color: #383838;
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
  var moment = require('moment')

  export default {
    props: [
      'notification'
    ],
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
