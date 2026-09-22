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
      return this.mergeClasses('border-t border-border bg-muted/50 font-medium');
    },
  },
});
</script>
