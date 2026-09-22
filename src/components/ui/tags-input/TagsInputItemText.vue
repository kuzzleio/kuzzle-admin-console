<template>
  <span :class="classes" data-slot="tags-input-item-text"><slot /></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* TagsInputItemText — API publique de shadcn-vue (ADR-0019). */
export default defineComponent({
  name: 'TagsInputItemText',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:truncate');
    },
  },
});
</script>
