<template>
  <b-card no-body class="Notification" :class="headerClass">
    <b-card-header @click="collapsed = !collapsed">
      <i
        :class="{ 'fa-caret-right': !collapsed, 'fa-caret-down': collapsed }"
        class="fa"
      />
      <i class="ml-2 fa" :class="`fa-${icon}`" /><span class="code">
        {{ text }}</span
      >
      <span class="text-secondary"> - {{ time }}</span>
    </b-card-header>
    <b-collapse v-model="collapsed" class="p-3 overflow-auto">
      <p v-json-formatter="{ content: notification, open: true }" />
    </b-collapse>
  </b-card>
</template>

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
    headerClass() {
      switch (this.notification.action) {
        case 'publish':
          return 'Notification--publish'
        case 'create':
        case 'createOrReplace':
        case 'replace':
          return 'Notification--document'
        case 'subscribe':
        case 'unsubscribe':
          return 'Notification--subscribe'
        case 'delete':
          return 'Notification--delete'
      }
      return ''
    },
    notificationId() {
      return this.notification.type === 'document' &&
        this.notification.result._id
        ? `(${this.notification.result._id})`
        : ''
    },
    icon() {
      switch (this.notification.action) {
        case 'publish':
          return 'paper-plane'
        case 'subscribe':
        case 'unsubscribe':
          return 'user'
        case 'delete':
          return 'remove'
      }
      return 'file'
    },
    time() {
      return moment(this.notification.timestamp).format('H:mm:ss')
    },
    text() {
      switch (this.notification.action) {
        case 'publish':
          return 'Volatile notification'
        case 'create':
        case 'createOrReplace':
        case 'replace':
          if (this.notification.state === 'done') {
            return `New document created ${this.notificationId}`
          }
          return `Pending document creation ${this.notificationId}`

        case 'update':
          return `Document updated ${this.notificationId}`
        case 'delete':
          if (this.notification.state === 'done') {
            return `Document deleted ${this.notificationId}`
          }
          return `Pending document deletion ${this.notificationId}`
        case 'subscribe':
          return 'A new user is listening to this room'

        case 'unsubscribe':
          return 'A user exited this room'
      }
      return 'New notification'
    }
  }
}
</script>

<style lang="scss" scoped>
$types: (
  'publish': #e3eff4,
  'document': #809199,
  'subscribe': #8e24aa,
  'delete': #e06660
);

@each $name, $value in $types {
  .Notification--#{$name} {
    border-color: desaturate(darken($value, 15%), 20%);
    .card-header {
      border-color: desaturate(darken($value, 15%), 20%);
      background-color: $value;
    }
  }
}
</style>
