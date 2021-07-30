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
  computed: {
    notificationVariant() {
      if (this.notification.applied) {
        return 'secondary'
      }
      switch (this.notification.action) {
        case 'create':
          return 'success'
        case 'replace':
        case 'update':
          return 'warning'
        case 'delete':
          return 'danger'
      }
      return 'secondary'
    },
    documentId() {
      return this.notification.type === 'document' &&
        this.notification.result._id
        ? truncateName(this.notification.result._id)
        : ''
    },
    time() {
      return moment(this.notification.timestamp).format('H:mm:ss')
    },
    text() {
      switch (this.notification.action) {
        case 'create':
          return `Creation (${this.documentId})`
        case 'replace':
          return `Replacement (${this.documentId})`
        case 'update':
          return `Update (${this.documentId})`
        case 'delete':
          return `Deletion (${this.documentId})`
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
</style>
