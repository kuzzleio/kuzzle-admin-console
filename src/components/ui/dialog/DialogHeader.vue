<template>
  <div :class="classes" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* En-tête de modale : titre et description. */
export default defineComponent({
  name: 'DialogHeader',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('flex flex-col gap-1.5 text-left');
    },
  },
});
</script>
