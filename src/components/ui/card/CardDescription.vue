<template>
  <p
    :class="cn('font-sans text-sm leading-normal text-muted-foreground', props.class)"
    data-slot="card-description"
  >
    <slot />
  </p>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
