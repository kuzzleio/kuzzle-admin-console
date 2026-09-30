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
      <JsonTree :value="notification" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Notification } from 'kuzzle-sdk-v7';

import { Card } from '@/components/ui/card';
import { formatClockTime } from '@/lib/date';
import { truncateName } from '@/utils';

import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';

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

// Le type du SDK, celui que `Watch` reçoit de `realtime.subscribe`.
const props = defineProps<{ notification: Notification }>();

const expanded = ref(false);

const family = computed((): string => {
  switch (props.notification.action) {
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
});

const headerClasses = computed((): string[] => [
  'flex w-full cursor-pointer items-center gap-2',
  'border-0 px-3 py-2 text-left',
  // Sans cette règle, le navigateur dessinait son propre contour (orange
  // en Electron) au clic, et rien de cohérent au clavier.
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
  'font-sans text-sm text-card-foreground',
  HEADER_BACKGROUNDS[family.value] ?? 'bg-muted',
]);

const notificationId = computed((): string =>
  props.notification.type === 'document' && props.notification.result._id
    ? truncateName(props.notification.result._id)
    : '',
);

const icon = computed((): string => {
  switch (props.notification.action) {
    case 'publish':
      return 'paper-plane';
    case 'subscribe':
    case 'unsubscribe':
      return 'user';
    case 'delete':
      return 'remove';
  }
  return 'file';
});

const time = computed((): string => formatClockTime(props.notification.timestamp));

const text = computed((): string => {
  switch (props.notification.action) {
    case 'publish':
      return 'Volatile notification';

    case 'mWrite':
    case 'mCreate':
    case 'mCreateOrReplace':
      return `New documents created (${notificationId.value})`;
    case 'write':
    case 'create':
    case 'createOrReplace':
      return `New document created (${notificationId.value})`;

    case 'mReplace':
      return `Documents replaced (${notificationId.value})`;
    case 'replace':
      return `Document replaced (${notificationId.value})`;

    case 'updateByQuery':
    case 'mUpdate':
      return `Documents updated (${notificationId.value})`;
    case 'update':
      return `Document updated (${notificationId.value})`;

    case 'deleteByQuery':
    case 'mDelete':
      return `Documents deleted (${notificationId.value})`;
    case 'delete':
      return `Document deleted (${notificationId.value})`;

    case 'subscribe':
      return 'A new user is listening to this room';

    case 'unsubscribe':
      return 'A user exited this room';
  }
  return 'New notification';
});
</script>
