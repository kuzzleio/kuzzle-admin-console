<template>
  <b-td :id="`col-${rowId}-${fieldName}`" class="ColumnViewTableCell cell realtime-highlight">
    <template v-if="data === null">
      <code>null</code>
    </template>
    <template v-else-if="data === undefined">
      <code>undefined</code>
    </template>
    <template v-else-if="Array.isArray(data)">
      <b-badge title="Unable to display array values in table cells, use the List view instead"
        >array</b-badge
      >
    </template>
    <template v-else-if="isObject(data)">
      <b-badge title="Unable to display object values in table cells, use the List view instead"
        >object</b-badge
      >
    </template>
    <template v-else>
      {{ formattedData }}
    </template>
  </b-td>
</template>

<script>
import isObject from 'lodash/isObject';

import { dateFromTimestamp } from '@/utils';

export default {
  name: 'ColumnViewTableCell',
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
