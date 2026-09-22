<template>
  <button
    aria-label="Dismiss"
    :class="classes"
    data-slot="toast-close"
    type="button"
    v-bind="$attrs"
    v-on="$listeners"
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
        'tw:appearance-none tw:border-0 tw:bg-transparent tw:p-0',
        'tw:cursor-pointer tw:leading-none tw:opacity-60',
        'tw:outline-none tw:hover:opacity-100',
        'tw:focus-visible:ring-2 tw:focus-visible:ring-ring',
      );
    },
  },
});
</script>
