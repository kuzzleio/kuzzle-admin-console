<template>
  <td :class="classes" data-slot="table-cell" v-bind="$attrs">
    <slot />
  </td>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableCell',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('px-3 py-2 align-middle');
    },
  },
});
</script>
