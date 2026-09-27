<template>
  <TableCell :id="`col-${rowId}-${fieldName}`" class="ColumnViewTableCell cell realtime-highlight">
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

<script>
import isObject from 'lodash/isObject';

import { Badge } from '@/components/ui/badge';
import { TableCell } from '@/components/ui/table';
import { dateFromTimestamp } from '@/utils';

export default {
  name: 'ColumnViewTableCell',
  components: {
    Badge,
    TableCell,
  },
  props: {
    autoSync: Boolean,
    data: {
      required: true,
    },
    fieldName: {
      type: String,
      required: true,
    },
    rowId: {
      type: String,
      required: true,
    },
    fieldType: {
      type: String,
    },
    notification: Object,
  },
  computed: {
    formattedData() {
      if (
        this.data &&
        this.fieldType === 'date' &&
        !Array.isArray(this.data) &&
        !isObject(this.data)
      ) {
        const dateObj = dateFromTimestamp(this.data);
        if (dateObj != null) {
          return dateObj.toLocaleString('en-GB');
        }
      }
      return this.data;
    },
  },
  watch: {
    data() {
      if (!this.autoSync) {
        return;
      }
      this.$el.classList.add('changed');
      setTimeout(() => this.$el.classList.remove('changed'), 200);
    },
  },
  methods: {
    isObject,
  },
};
</script>
