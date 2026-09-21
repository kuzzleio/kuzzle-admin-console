<template>
  <div :class="classes" data-slot="select-label" v-bind="$attrs" v-on="$listeners">
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
        'tw:px-2 tw:py-1.5 tw:pl-8 tw:font-sans tw:text-xs tw:font-medium tw:text-muted-foreground',
      );
    },
  },
});
</script>
