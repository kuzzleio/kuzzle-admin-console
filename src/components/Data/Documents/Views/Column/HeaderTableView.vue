<template>
  <TableHead
    :id="`header-col-${field}`"
    class="draggableItem"
    :data-cy="`ColumnViewHead--${field}`"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <div class="flex items-center gap-2">
      <i
        aria-hidden="true"
        class="handle fas fa-arrows-alt"
        :class="{ invisible: !displayDragIcon }"
      />
      <span>{{ field }}</span>
    </div>
  </TableHead>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { TableHead } from '@/components/ui/table';

export default defineComponent({
  name: 'HeaderTableView',
  components: {
    TableHead,
  },
  props: {
    displayDragIcon: {
      default: false,
      type: Boolean,
    },
    field: {
      default: '',
      type: String,
    },
  },
});
</script>
