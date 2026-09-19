<template>
  <h3 :class="classes" v-bind="$attrs" v-on="$listeners">
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
      return this.mergeClasses(
        'tw:font-sans tw:text-base tw:font-semibold tw:leading-none tw:text-card-foreground',
      );
    },
  },
});
</script>
