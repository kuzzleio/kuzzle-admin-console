<template>
  <li data-slot="pagination-item">
    <PaginationLast
      aria-label="Go to last page"
      :class="cn(buttonVariants({ variant: 'ghost', size }), props.class)"
      data-slot="pagination-last"
      v-bind="{ ...$attrs, ...delegatedProps }"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-double-right" /></slot>
    </PaginationLast>
  </li>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PaginationLast, type PaginationLastProps } from 'reka-ui';

import { type ButtonVariants, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * PaginationLast de shadcn-vue (ADR-0013, ADR-0054). Symétrique de
 * `PaginationFirst`.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    PaginationLastProps & { class?: HTMLAttributes['class']; size?: ButtonVariants['size'] }
  >(),
  { size: 'icon' },
);

const delegatedProps = reactiveOmit(props, 'class', 'size');
</script>
