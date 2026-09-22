<template>
  <Card
    class="Notification gap-0 overflow-hidden rounded-none border-b-0 py-0 shadow-none first:rounded-t-md last:rounded-b-md last:border-b"
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
      <span class="text-muted-foreground">— {{ time }}</span>
    </button>
    <div v-if="expanded" class="overflow-auto p-3">
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
  document: 'bg-notification-document',
  delete: 'bg-notification-delete',
  publish: 'bg-notification-publish',
  subscribe: 'bg-notification-subscribe',
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
        'flex w-full cursor-pointer items-center gap-2',
        'border-0 px-3 py-2 text-left',
        'font-sans text-sm text-card-foreground',
        HEADER_BACKGROUNDS[this.family] ?? 'bg-muted',
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
