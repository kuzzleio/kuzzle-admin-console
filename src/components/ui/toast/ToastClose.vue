<template>
  <button
    aria-label="Dismiss"
    :class="classes"
    data-slot="toast-close"
    type="button"
    v-bind="$attrs"
  >
    <slot><i aria-hidden="true" class="fa fa-times" /></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * ToastClose — API publique de shadcn-vue (ADR-0020).
 *
 * Sans preflight (ADR-0008), un `<button>` garde la bordure et le fond du
 * navigateur : les deux sont retirés explicitement (G-021).
 */
export default defineComponent({
  name: 'ToastClose',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'appearance-none border-0 bg-transparent p-0',
        'cursor-pointer leading-none opacity-60',
        'outline-none hover:opacity-100',
        'focus-visible:ring-2 focus-visible:ring-ring',
      );
    },
  },
});
</script>
