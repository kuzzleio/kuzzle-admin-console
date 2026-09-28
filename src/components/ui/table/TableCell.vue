<template>
  <td :class="cn('px-3 py-2 align-middle', props.class)" data-slot="table-cell">
    <slot />
  </td>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
