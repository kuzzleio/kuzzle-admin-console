<template>
  <TableCell
    :id="`col-${rowId}-${fieldName}`"
    ref="cell"
    class="ColumnViewTableCell cell realtime-highlight"
  >
    <template v-if="data === null">
      <code>null</code>
    </template>
    <template v-else-if="data === undefined">
      <code>undefined</code>
    </template>
    <template v-else-if="Array.isArray(data)">
      <Badge
        variant="secondary"
        title="Unable to display array values in table cells, use the List view instead"
        >array</Badge
      >
    </template>
    <template v-else-if="isObject(data)">
      <Badge
        variant="secondary"
        title="Unable to display object values in table cells, use the List view instead"
        >object</Badge
      >
    </template>
    <template v-else>
      {{ formattedData }}
    </template>
  </TableCell>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue';
import isObject from 'lodash/isObject';

import { Badge } from '@/components/ui/badge';
import { TableCell } from '@/components/ui/table';
import { formatDateTime } from '@/lib/date';
import { dateFromTimestamp } from '@/utils';

const props = withDefaults(
  defineProps<{
    autoSync?: boolean;
    data: unknown;
    fieldName: string;
    fieldType?: string;
    rowId: string;
  }>(),
  { fieldType: undefined },
);

// `$el` du composant : la cellule `<td>` que rend `TableCell`.
const cell = useTemplateRef<InstanceType<typeof TableCell>>('cell');

const formattedData = computed((): unknown => {
  const { data } = props;
  if (
    data &&
    props.fieldType === 'date' &&
    (typeof data === 'string' || typeof data === 'number')
  ) {
    const dateObj = dateFromTimestamp(data);
    if (dateObj != null) {
      return formatDateTime(dateObj);
    }
  }
  return data;
});

watch(
  () => props.data,
  () => {
    const el = cell.value?.$el;
    if (!props.autoSync || !(el instanceof HTMLElement)) {
      return;
    }
    el.classList.add('changed');
    setTimeout(() => el.classList.remove('changed'), 200);
  },
);
</script>
