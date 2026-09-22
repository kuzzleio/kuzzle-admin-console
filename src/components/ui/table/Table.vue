<template>
  <div :class="wrapperClasses" data-slot="table-container">
    <table :class="classes" data-slot="table" v-bind="$attrs" v-on="$listeners">
      <slot />
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * Table — API publique de shadcn-vue (ADR-0009, ADR-0011).
 *
 * Remplace la famille `b-table-simple`. C'est du **balisage** : la primitive ne
 * connaît ni les données, ni le tri, ni le filtre. Le composant amont n'en sait
 * pas plus — il n'existe pas de `DataTable` chez shadcn-vue, et la logique de
 * liste reste dans les pages (ADR-0011).
 *
 * L'enveloppe `overflow-x-auto` remplace la prop `responsive` de `bootstrap-vue`
 * et est portée par la primitive : un tableau qui déborde sans défilement coupe
 * ses dernières colonnes, et ça ne se voit qu'en petite fenêtre.
 */
export default defineComponent({
  name: 'Table',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    wrapperClasses(): string {
      return 'relative w-full overflow-x-auto';
    },
    classes(): string {
      return this.mergeClasses('w-full caption-bottom font-sans text-sm');
    },
  },
});
</script>
