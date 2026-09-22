<template>
  <strong :class="classes" data-slot="toast-title" v-bind="$attrs"><slot /></strong>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* ToastTitle — API publique de shadcn-vue (ADR-0020). */
export default defineComponent({
  name: 'ToastTitle',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:font-semibold');
    },
  },
});
</script>
