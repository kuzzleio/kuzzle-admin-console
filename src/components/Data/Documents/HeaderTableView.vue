<template>
  <b-th
    :id="`header-col-${field}`"
    class="draggableItem"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <div class="table-head">
      <i
        :class="
          `handle fas fa-arrows-alt ${displayDragIcon ? '' : 'hideDragIcon'}`
        "
      />
      <span class="pr-2">{{ field }}</span>
    </div>
  </b-th>
</template>

<script>
export default {
  name: 'HeaderTableView',
  props: {
    field: {
      type: String,
      default: ''
    },
    displayDragIcon: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {}
  },
  methods: {},
  mounted() {}
}
</script>

<style lang="scss">
.hideDragIcon {
  visibility: hidden;
}

.table-head {
  display: table;
  width: 100%;
  i,
  .handle {
    display: table-cell;
    width: 20px;
    max-width: 20px;
  }

  span {
    display: table-cell;
  }
}
</style>
