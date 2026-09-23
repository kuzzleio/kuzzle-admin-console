<template>
  <div :class="classes" data-slot="select-label" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Intitulé d'un groupe d'options. Décalé comme les options pour que les textes
 * s'alignent, coche comprise. */
export default defineComponent({
  name: 'SelectLabel',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'px-2 py-1.5 pl-8 font-sans text-xs font-medium text-muted-foreground',
      );
    },
  },
});
</script>
