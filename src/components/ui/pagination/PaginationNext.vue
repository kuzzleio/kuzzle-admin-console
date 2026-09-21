<template>
  <li data-slot="pagination-item">
    <button
      :aria-label="ariaLabel"
      :class="classes"
      data-slot="pagination-next"
      :disabled="pagination.disabled || pagination.isLast"
      type="button"
      v-bind="$attrs"
      v-on="$listeners"
      @click="onClick"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-right" /></slot>
    </button>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { paginationEdge } from './edge';

/*
 * PaginationNext — API publique de shadcn-vue (ADR-0013).
 *
 * Symétrique de `PaginationPrevious`.
 */
export default defineComponent({
  name: 'PaginationNext',
  mixins: [paginationEdge],
  props: {
    ariaLabel: {
      default: 'Go to next page',
      type: String,
    },
  },
  methods: {
    onClick(): void {
      this.pagination.goTo(this.pagination.currentPage + 1);
    },
  },
});
</script>
