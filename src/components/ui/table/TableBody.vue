<template>
  <tbody :class="cn('[&_tr:last-child]:border-0', props.class)" data-slot="table-body">
    <slot />
  </tbody>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
