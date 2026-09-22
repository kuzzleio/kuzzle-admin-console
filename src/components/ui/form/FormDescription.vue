<template>
  <p :class="classes" data-slot="form-description" v-bind="$attrs" v-on="$listeners">
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Texte d'aide d'un champ. Remplace la prop `description` de `b-form-group`. */
export default defineComponent({
  name: 'FormDescription',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('font-sans text-sm text-muted-foreground');
    },
  },
});
</script>
