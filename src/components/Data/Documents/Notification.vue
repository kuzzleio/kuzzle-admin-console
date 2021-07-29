<template>
  <b-list-group-item :variant="notificationVariant">
    <span class="text-secondary">{{ time }}</span>
    <i class="cursor ml-3 fa-lg fas fa-trash" @click="$emit('clear')" />
    <span v-if="notification.applied" class="text-secondary"> - Applied</span>
    <b-button
      size="sm"
      variant="success"
      pill
      v-else
      @click="$emit('apply')"
      class="mx-2"
    >
      Apply change
    </b-button>
    <p class="code mb-0">
      {{ text }}
    </p>
  </b-list-group-item>
</template>

<script>
import { truncateName } from '../../../utils'
import moment from 'moment'

export default {
  name: 'Notification',
  directives: {},
  props: ['notification'],
  data() {
    return {}
  },
  watch: {
    notification: {
      deep: true,
      handler(value) {
        this.$log.debug('notif', value)
      }
    }
  },
  computed: {
    notificationVariant() {
      this.$log.debug('NOTIFICATION.ACTION', this.notification)
      if (this.notification.applied) {
        return 'secondary'
      }
      switch (this.notification.action) {
        case 'create':
        case 'createOrReplace':
          return 'success'
        case 'replace':
        case 'update':
          return 'warning'
        case 'delete':
          return 'danger'
      }
      return 'secondary'
    },
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
        ? truncateName(this.notification.result._id)
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
        case 'create':
          return `Creation (${this.notificationId})`
        case 'replace':
          return `Replacement (${this.notificationId})`
        case 'update':
          return `Update (${this.notificationId})`
        case 'delete':
          return `Deletion (${this.notificationId})`
      }
      return 'New notification'
    }
  }
}
</script>

<style lang="scss" scoped>
.cursor {
  cursor: pointer;
}

$types: (
  'publish': #e3eff4,
  'document': #cae6d3,
  'subscribe': #e1c8e8,
  'delete': #e6c6c4
);

@each $name, $value in $types {
  .Notification {
    border-radius: 0;
    border-width: 0 1px 0 1px;
    & .card-header {
      border-radius: 0;
    }

    &:first-child {
      border-radius: 0.25rem 0.25rem 0 0;
      border-width: 1px 1px 0 1px;
    }
    &:last-child {
      border-radius: 0 0 0.25rem 0.25rem;
      border-width: 0 1px 1px 1px;
    }
    &:only-child {
      border-radius: 0.25rem 0.25rem 0.25rem 0.25rem;
      border-width: 1px 1px 1px 1px;
    }
  }

  .Notification--#{$name} {
    .card-header {
      background-color: $value;
    }
  }
}
</style>
