<template>
  <li data-slot="pagination-item">
    <button
      :aria-label="ariaLabel"
      :class="classes"
      data-slot="pagination-previous"
      :disabled="pagination.disabled || pagination.isFirst"
      type="button"
      v-bind="$attrs"
      v-on="$listeners"
      @click="onClick"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-left" /></slot>
    </button>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { paginationEdge } from './edge';

/*
 * PaginationPrevious — API publique de shadcn-vue (ADR-0013).
 *
 * Désactivé sur la première page plutôt que masqué : une barre dont les boutons apparaissent et disparaissent change de largeur à chaque clic.
 */
export default defineComponent({
  name: 'PaginationPrevious',
  mixins: [paginationEdge],
  props: {
    ariaLabel: {
      default: 'Go to previous page',
      type: String,
    },
  },
  methods: {
    onClick(): void {
      this.pagination.goTo(this.pagination.currentPage - 1);
    },
  },
});
</script>
