<template>
  <div :class="classes" v-bind="$attrs" v-on="$listeners">
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
        'tw:flex tw:flex-col tw:gap-6 tw:rounded-lg tw:border tw:border-border tw:bg-card tw:text-card-foreground tw:py-6 tw:shadow-sm',
      );
    },
  },
});
</script>
