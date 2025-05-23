<template>
  <b-card class="Notification" data-cy="Notification" no-body :class="headerClass">
    <b-card-header data-cy="Notification-header" @click="collapsed = !collapsed">
      <i :class="{ 'fa-caret-right': !collapsed, 'fa-caret-down': collapsed }" class="fa" />
      <i class="ml-3 fa" :class="`fa-${icon}`" /><span class="code"> {{ text }}</span>
      <span class="text-secondary"> - {{ time }}</span>
    </b-card-header>
    <b-collapse v-model="collapsed" class="p-3 overflow-auto">
      <p v-json-formatter="{ content: notification, open: true }" />
    </b-collapse>
  </b-card>
</template>

<script>
import moment from 'moment';

import JsonFormatter from '@/directives/json-formatter.directive';
import { truncateName } from '@/utils';

export default {
  name: 'Notification',
  directives: {
    JsonFormatter,
  },
  props: ['notification'],
  data() {
    return {
      collapsed: false,
    };
  },
  computed: {
    headerClass() {
      switch (this.notification.action) {
        case 'publish':
          return 'Notification--publish';
        case 'create':
        case 'createOrReplace':
        case 'replace':
          return 'Notification--document';
        case 'subscribe':
        case 'unsubscribe':
          return 'Notification--subscribe';
        case 'delete':
          return 'Notification--delete';
      }
      return '';
    },
    notificationId() {
      return this.notification.type === 'document' && this.notification.result._id
        ? truncateName(this.notification.result._id)
        : '';
    },
    icon() {
      switch (this.notification.action) {
        case 'publish':
          return 'paper-plane';
        case 'subscribe':
        case 'unsubscribe':
          return 'user';
        case 'delete':
          return 'remove';
      }
      return 'file';
    },
    time() {
      return moment(this.notification.timestamp).format('H:mm:ss');
    },
    text() {
      switch (this.notification.action) {
        case 'publish':
          return 'Volatile notification';

        case 'mWrite':
        case 'mCreate':
        case 'mCreateOrReplace':
          return `New documents created (${this.notificationId})`;
        case 'write':
        case 'create':
        case 'createOrReplace':
          return `New document created (${this.notificationId})`;

        case 'mReplace':
          return `Documents replaced (${this.notificationId})`;
        case 'replace':
          return `Document replaced (${this.notificationId})`;

        case 'updateByQuery':
        case 'mUpdate':
          return `Documents updated (${this.notificationId})`;
        case 'update':
          return `Document updated (${this.notificationId})`;

        case 'deleteByQuery':
        case 'mDelete':
          return `Documents deleted (${this.notificationId})`;
        case 'delete':
          return `Document deleted (${this.notificationId})`;

        case 'subscribe':
          return 'A new user is listening to this room';

        case 'unsubscribe':
          return 'A user exited this room';
      }
      return 'New notification';
    },
  },
};
</script>

<style lang="scss" scoped>
$types: (
  'publish': #e3eff4,
  'document': #cae6d3,
  'subscribe': #e1c8e8,
  'delete': #e6c6c4,
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
