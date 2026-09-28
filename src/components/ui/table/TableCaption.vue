<template>
  <caption :class="cn('mt-4 text-sm text-muted-foreground', props.class)" data-slot="table-caption">
    <slot />
  </caption>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
