<template>
  <p :class="classes" v-bind="$attrs">
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Description de Card. `m-0` est nécessaire : sans preflight, la marge du
 * navigateur sur `<p>` subsiste (ADR-0008). */
export default defineComponent({
  name: 'CardDescription',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('font-sans text-sm leading-normal text-muted-foreground m-0');
    },
  },
});
</script>
