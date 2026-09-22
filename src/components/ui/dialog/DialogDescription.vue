<template>
  <p :class="classes" v-bind="$attrs" v-on="$listeners">
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Description de modale. `m-0` : sans preflight, la marge du navigateur sur
 * `<p>` subsiste (ADR-0008). */
export default defineComponent({
  name: 'DialogDescription',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('m-0 font-sans text-sm leading-normal text-muted-foreground');
    },
  },
});
</script>
