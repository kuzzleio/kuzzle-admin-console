<template>
  <div :class="classes" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Pied de Card : les actions. */
export default defineComponent({
  name: 'CardFooter',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:flex tw:items-center tw:gap-2 tw:px-6');
    },
  },
});
</script>
