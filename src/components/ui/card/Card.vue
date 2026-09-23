<template>
  <div :class="classes" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * Card — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `<b-card>` et sa famille. L'espacement vertical est porté par le
 * conteneur (`gap`) et non par des marges sur chaque section : c'est ce qui
 * évite les marges qui s'annulent ou se cumulent quand une section est absente.
 *
 * Le preflight n'étant pas chargé (ADR-0008), bordure, fond et rayon sont posés
 * explicitement plutôt que supposés.
 */
export default defineComponent({
  name: 'Card',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'flex flex-col gap-6 rounded-lg border border-border bg-card text-card-foreground py-6 shadow-sm',
      );
    },
  },
});
</script>
