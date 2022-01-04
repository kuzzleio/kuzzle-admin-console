<template>
  <b-td class="ColumnViewTableCell cell" :id="`col-${rowId}-${fieldName}`">
    <template v-if="data === null">
      <code>null</code>
    </template>
    <template v-else-if="data === undefined">
      <code>undefined</code>
    </template>
    <template v-else-if="Array.isArray(data)">
      <b-badge
        title="Unable to display array values in table cells, use the List view instead"
        >array</b-badge
      >
    </template>
    <template v-else-if="isObject(data)">
      <b-badge
        title="Unable to display object values in table cells, use the List view instead"
        >object</b-badge
      >
    </template>
    <template v-else>
      {{ data }}
    </template>
  </b-td>
</template>

<script>
import isObject from 'lodash/isObject'

export default {
  name: 'ColumnViewTableCell',
  props: {
    autoSync: Boolean,
    data: {
      required: true
    },
    fieldName: {
      type: String,
      required: true
    },
    rowId: {
      type: String,
      required: true
    }
  },
  methods: {
    isObject: isObject
  },
  watch: {
    data() {
      if (!this.autoSync) {
        return
      }
      this.$el.classList.add('ColumnViewTableCell--changed')
      setTimeout(
        () => this.$el.classList.remove('ColumnViewTableCell--changed'),
        200
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.ColumnViewTableCell {
  transition: background-color 1.2s ease;
}
.ColumnViewTableCell--changed {
  transition: background-color 0.1s ease;
  background-color: rgb(255, 238, 161);
}
</style>
