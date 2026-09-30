<template>
  <TableRow ref="row" class="HighlightableRow realtime-highlight">
    <slot />
  </TableRow>
</template>

<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';

import type { DocumentNotification } from '../../types';
import { TableRow } from '@/components/ui/table';
import { getBadgeText } from '@/services/documentNotifications';

const props = withDefaults(
  defineProps<{
    autoSync?: boolean;
    notification?: DocumentNotification | null;
  }>(),
  { autoSync: false, notification: null },
);

// `$el` du composant : la ligne `<tr>` que rend `TableRow`.
const row = useTemplateRef<InstanceType<typeof TableRow>>('row');

watch(
  () => props.notification,
  (n) => {
    const el = row.value?.$el;
    if (!props.autoSync || !n || !(el instanceof HTMLElement)) {
      return;
    }
    if (['create', 'delete'].includes(n.action)) {
      el.classList.add(getBadgeText(n.action));
      setTimeout(() => el.classList.remove(getBadgeText(n.action)), 200);
    }
  },
);
</script>
