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
        'h-10 px-3 text-left align-middle',
        'font-medium whitespace-nowrap text-muted-foreground',
      );
    },
  },
});
</script>
