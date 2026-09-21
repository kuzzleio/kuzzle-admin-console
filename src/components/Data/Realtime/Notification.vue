<template>
  <Card
    class="Notification tw:gap-0 tw:overflow-hidden tw:rounded-none tw:border-b-0 tw:py-0 tw:shadow-none tw:first:rounded-t-md tw:last:rounded-b-md tw:last:border-b"
    data-cy="Notification"
  >
    <button
      :aria-expanded="expanded ? 'true' : 'false'"
      :class="headerClasses"
      data-cy="Notification-header"
      type="button"
      @click="expanded = !expanded"
    >
      <i aria-hidden="true" :class="['fa', expanded ? 'fa-caret-down' : 'fa-caret-right']" />
      <i aria-hidden="true" class="fa" :class="`fa-${icon}`" />
      <span class="code">{{ text }}</span>
      <span class="tw:text-muted-foreground">— {{ time }}</span>
    </button>
    <div v-if="expanded" class="tw:overflow-auto tw:p-3">
      <p v-json-formatter="{ content: notification, open: true }" />
    </div>
  </Card>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import moment from 'moment';

import { Card } from '@/components/ui/card';
import JsonFormatter from '@/directives/json-formatter.directive';
import { truncateName } from '@/utils';

interface RealtimeNotification {
  action?: string;
  result?: { _id?: string };
  timestamp?: number;
  type?: string;
}

/*
 * Une notification du flux temps réel, repliable.
 *
 * Les quatre familles (publication, document, souscription, suppression) se
 * distinguent par la couleur de leur en-tête, prise dans les tokens
 * `notification-*` — la teinte n'est pas une décoration, c'est ce qui rend un
 * flux qui défile lisible d'un coup d'œil.
 *
 * Les classes sont écrites en clair et non composées : Tailwind lit les
 * sources en texte, une classe fabriquée par concaténation n'existerait pas
 * dans la feuille produite.
 */
const HEADER_BACKGROUNDS: Record<string, string> = {
  document: 'tw:bg-notification-document',
  delete: 'tw:bg-notification-delete',
  publish: 'tw:bg-notification-publish',
  subscribe: 'tw:bg-notification-subscribe',
};

export default defineComponent({
  name: 'Notification',
  directives: {
    JsonFormatter,
  },
  components: {
    Card,
  },
  props: {
    notification: {
      required: true,
      type: Object as PropType<RealtimeNotification>,
    },
  },
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    family(): string {
      switch (this.notification.action) {
        case 'publish':
          return 'publish';
        case 'create':
        case 'createOrReplace':
        case 'replace':
          return 'document';
        case 'subscribe':
        case 'unsubscribe':
          return 'subscribe';
        case 'delete':
          return 'delete';
      }
      return '';
    },
    headerClasses(): string[] {
      return [
        'tw:flex tw:w-full tw:cursor-pointer tw:items-center tw:gap-2',
        'tw:border-0 tw:px-3 tw:py-2 tw:text-left',
        'tw:font-sans tw:text-sm tw:text-card-foreground',
        HEADER_BACKGROUNDS[this.family] ?? 'tw:bg-muted',
      ];
    },
    notificationId(): string {
      return this.notification.type === 'document' && this.notification.result?._id
        ? truncateName(this.notification.result._id)
        : '';
    },
    icon(): string {
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
    time(): string {
      return moment(this.notification.timestamp).format('H:mm:ss');
    },
    text(): string {
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
});
</script>
