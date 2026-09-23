<template>
  <li data-slot="pagination-item">
    <button
      :aria-label="ariaLabel"
      :class="classes"
      data-slot="pagination-last"
      :disabled="pagination.disabled || pagination.isLast"
      type="button"
      v-bind="$attrs"
      @click="onClick"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-double-right" /></slot>
    </button>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { paginationEdge } from './edge';

/*
 * PaginationLast — API publique de shadcn-vue (ADR-0013).
 *
 * Symétrique de `PaginationFirst`.
 */
export default defineComponent({
  name: 'PaginationLast',
  mixins: [paginationEdge],
  props: {
    ariaLabel: {
      default: 'Go to last page',
      type: String,
    },
  },
  methods: {
    onClick(): void {
      this.pagination.goTo(this.pagination.pageCount);
    },
  },
});
</script>
