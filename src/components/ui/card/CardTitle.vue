<template>
  <h3 :class="classes" v-bind="$attrs">
    <slot />
  </h3>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Titre de Card. `h3` par défaut — à revoir sur un écran où la hiérarchie
 * des titres impose autre chose. */
export default defineComponent({
  name: 'CardTitle',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('font-sans text-title font-bold text-card-foreground');
    },
  },
});
</script>
