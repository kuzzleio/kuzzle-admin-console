<template>
  <div :class="classes" data-slot="resizable-panel" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * ResizablePanel — API publique de shadcn-vue (ADR-0021).
 *
 * Il ne porte aucune taille : le panneau redimensionnable reçoit la sienne du
 * site d'appel (un `:style` ou une classe), et l'autre occupe ce qui reste.
 * C'est la contrepartie du point 1 d'ADR-0021.
 */
export default defineComponent({
  name: 'ResizablePanel',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('min-h-0 min-w-0');
    },
  },
});
</script>
