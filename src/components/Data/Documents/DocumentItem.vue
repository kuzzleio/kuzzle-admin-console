<template>
  <div class="collapsible-header unselectable" :class="notification.class" @click="toggleCollapse"><i v-bind:class="{'fa-caret-right': collapsed, 'fa-caret-down': !collapsed}" class="fa"></i> <i class="fa fa-{{document.icon}}"></i> {{document.text}}</div>
  <div class="collapsible-body" v-if="document.source"><p v-json-formatter="document.source"></p></div>
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

  export default {
    name: 'Document',
    props: [
      'document'
    ],
    directives: {
      JsonFormatter
    },
    data () {
      return {
        collapsed: true
      }
    },
    methods: {
      toggleCollapse: function () {
        this.collapsed = !this.collapsed
      }
    }
  }
</script>
