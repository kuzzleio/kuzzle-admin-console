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
      return this.mergeClasses('mt-4 text-sm text-muted-foreground');
    },
  },
});
</script>
