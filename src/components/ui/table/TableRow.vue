<template>
  <tr
    :class="cn('border-b border-border transition-colors hover:bg-accent', props.class)"
    data-slot="table-row"
  >
    <slot />
  </tr>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
