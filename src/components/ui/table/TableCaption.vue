<template>
  <caption :class="classes" data-slot="table-caption" v-bind="$attrs" v-on="$listeners">
    <slot />
  </caption>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableCaption',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:mt-4 tw:text-sm tw:text-muted-foreground');
    },
  },
});
</script>
