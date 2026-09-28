<template>
  <tfoot
    :class="cn('border-t border-border bg-muted/50 font-medium', props.class)"
    data-slot="table-footer"
  >
    <slot />
  </tfoot>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
