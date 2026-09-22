<template>
  <div :class="classes" data-slot="toast-description" v-bind="$attrs"><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* ToastDescription — API publique de shadcn-vue (ADR-0020). */
export default defineComponent({
  name: 'ToastDescription',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('opacity-90');
    },
  },
});
</script>
