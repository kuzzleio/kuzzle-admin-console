<template>
  <li data-slot="pagination-item">
    <PaginationNext
      aria-label="Go to next page"
      :class="cn(buttonVariants({ variant: 'ghost', size }), props.class)"
      data-slot="pagination-next"
      v-bind="{ ...$attrs, ...delegatedProps }"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-right" /></slot>
    </PaginationNext>
  </li>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PaginationNext, type PaginationNextProps } from 'reka-ui';

import { type ButtonVariants, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * PaginationNext de shadcn-vue (ADR-0013, ADR-0054). Symétrique de
 * `PaginationPrevious`.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    PaginationNextProps & { class?: HTMLAttributes['class']; size?: ButtonVariants['size'] }
  >(),
  { size: 'icon' },
);

const delegatedProps = reactiveOmit(props, 'class', 'size');
</script>
