<template>
  <thead :class="classes" data-slot="table-header" v-bind="$attrs">
    <slot />
  </thead>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableHeader',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('border-b border-border');
    },
  },
});
</script>
