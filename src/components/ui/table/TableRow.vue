<template>
  <tr :class="classes" data-slot="table-row" v-bind="$attrs" v-on="$listeners">
    <slot />
  </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableRow',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:border-b tw:border-border tw:transition-colors tw:hover:bg-muted/50',
      );
    },
  },
});
</script>
