<template>
  <th :class="classes" data-slot="table-head" v-bind="$attrs" v-on="$listeners">
    <slot />
  </th>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableHead',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:h-10 tw:px-3 tw:text-left tw:align-middle',
        'tw:font-medium tw:whitespace-nowrap tw:text-muted-foreground',
      );
    },
  },
});
</script>
