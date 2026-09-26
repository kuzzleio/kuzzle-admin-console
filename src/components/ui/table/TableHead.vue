<template>
  <th :class="classes" data-slot="table-head" v-bind="$attrs">
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
        // Libellé de section du DS : capitales, 11 px, Label Slate.
        'text-label font-bold uppercase whitespace-nowrap text-label-slate',
      );
    },
  },
});
</script>
