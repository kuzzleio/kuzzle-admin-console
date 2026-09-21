<template>
  <div :class="classes" data-slot="select-separator" role="separator" v-bind="$attrs" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'SelectSeparator',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:-mx-1 tw:my-1 tw:h-px tw:bg-border');
    },
  },
});
</script>
