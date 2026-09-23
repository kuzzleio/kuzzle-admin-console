<template>
  <tbody :class="classes" data-slot="table-body" v-bind="$attrs">
    <slot />
  </tbody>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableBody',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('[&_tr:last-child]:border-0');
    },
  },
});
</script>
