<template>
  <div :class="classes" v-bind="$attrs">
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
      return this.mergeClasses('flex items-center gap-2 px-6');
    },
  },
});
</script>
