<template>
  <div :class="classes" v-bind="$attrs" v-on="$listeners">
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
      return this.mergeClasses('tw:flex tw:flex-col tw:gap-1.5 tw:text-left');
    },
  },
});
</script>
