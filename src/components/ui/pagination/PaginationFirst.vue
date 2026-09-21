<template>
  <li data-slot="pagination-item">
    <button
      :aria-label="ariaLabel"
      :class="classes"
      data-slot="pagination-first"
      :disabled="pagination.disabled || pagination.isFirst"
      type="button"
      v-bind="$attrs"
      v-on="$listeners"
      @click="onClick"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-double-left" /></slot>
    </button>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { paginationEdge } from './edge';

/*
 * PaginationFirst — API publique de shadcn-vue (ADR-0013).
 *
 * Le libellé est une prop : la barre des documents et celle des rôles n'ont pas à s'annoncer de la même façon quand elles cohabitent sur un même écran.
 */
export default defineComponent({
  name: 'PaginationFirst',
  mixins: [paginationEdge],
  props: {
    ariaLabel: {
      default: 'Go to first page',
      type: String,
    },
  },
  methods: {
    onClick(): void {
      this.pagination.goTo(1);
    },
  },
});
</script>
