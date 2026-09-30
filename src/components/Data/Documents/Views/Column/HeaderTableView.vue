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

<script setup lang="ts">
import { TableHead } from '@/components/ui/table';

withDefaults(
  defineProps<{
    displayDragIcon?: boolean;
    field?: string;
  }>(),
  { displayDragIcon: false, field: '' },
);

defineEmits<{
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
}>();
</script>
