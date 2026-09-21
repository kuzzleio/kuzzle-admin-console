<template>
  <TableRow class="HighlightableRow realtime-highlight">
    <slot />
  </TableRow>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { TableRow } from '@/components/ui/table';
import { getBadgeText } from '@/services/documentNotifications';

export default defineComponent({
  name: 'HighlightableRow',
  components: {
    TableRow,
  },
  props: {
    autoSync: {
      default: false,
      type: Boolean,
    },
    notification: {
      default: null,
      type: Object as PropType<{ action: string } | null>,
    },
  },
  watch: {
    notification(n: { action: string } | null) {
      if (!this.autoSync || !n) {
        return;
      }
      if (['create', 'delete'].includes(n.action)) {
        this.$el.classList.add(getBadgeText(n.action));
        setTimeout(() => this.$el.classList.remove(getBadgeText(n.action)), 200);
      }
    },
  },
});
</script>
