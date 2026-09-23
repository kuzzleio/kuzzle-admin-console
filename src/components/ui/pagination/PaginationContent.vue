<template>
  <ul :class="classes" data-slot="pagination-content" v-bind="$attrs">
    <slot :items="pagination.items" />
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { paginationContext } from './context';

/*
 * PaginationContent — API publique de shadcn-vue (ADR-0013).
 *
 * Donne les emplacements calculés par la racine au site d'appel, comme le
 * `PaginationList` de `reka-ui` en amont. Le `<ul>` n'est pas décoratif : une
 * barre de pagination est une liste de liens, et c'est ce qui donne aux
 * lecteurs d'écran le nombre de pages.
 */
export default defineComponent({
  name: 'PaginationContent',
  mixins: [classMerge, paginationContext],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('flex flex-row items-center gap-1 list-none m-0 p-0');
    },
  },
});
</script>
