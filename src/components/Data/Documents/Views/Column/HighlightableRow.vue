<template>
  <b-tr class="HighlightableRow realtime-highlight">
    <slot />
  </b-tr>
</template>

<script>
import { getBadgeText } from '@/services/documentNotifications';

export default {
  name: 'HighlightableRow',
  props: {
    notification: Object,
    autoSync: Boolean,
  },
  watch: {
    notification(n) {
      if (!this.autoSync || !n) {
        return;
      }
      if (['create', 'delete'].includes(n.action)) {
        this.$el.classList.add(getBadgeText(n.action));
        setTimeout(() => this.$el.classList.remove(getBadgeText(n.action)), 200);
      }
    },
  },
};
</script>

<style></style>
