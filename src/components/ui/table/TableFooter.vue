<template>
  <tfoot :class="classes" data-slot="table-footer" v-bind="$attrs" v-on="$listeners">
    <slot />
  </tfoot>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableFooter',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:border-t tw:border-border tw:bg-muted/50 tw:font-medium');
    },
  },
});
</script>
