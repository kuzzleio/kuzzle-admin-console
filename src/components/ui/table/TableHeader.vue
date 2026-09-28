<template>
  <thead :class="cn('border-b border-border bg-subtle', props.class)" data-slot="table-header">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
