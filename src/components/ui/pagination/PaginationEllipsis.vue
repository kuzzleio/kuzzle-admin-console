<template>
  <li data-slot="pagination-item">
    <span
      aria-hidden="true"
      :class="classes"
      data-slot="pagination-ellipsis"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot>…</slot>
    </span>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * PaginationEllipsis — API publique de shadcn-vue (ADR-0013).
 *
 * `aria-hidden` : les pages omises ne sont pas une information pour un lecteur
 * d'écran, qui connaît déjà le nombre d'éléments de la liste. L'annoncer
 * donnerait « points de suspension » entre deux numéros de page.
 */
export default defineComponent({
  name: 'PaginationEllipsis',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:inline-flex tw:h-9 tw:min-w-9 tw:items-center tw:justify-center tw:text-sm tw:text-muted-foreground',
      );
    },
  },
});
</script>
