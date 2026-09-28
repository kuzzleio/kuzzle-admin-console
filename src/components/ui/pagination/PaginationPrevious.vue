<template>
  <li data-slot="pagination-item">
    <PaginationPrev
      aria-label="Go to previous page"
      :class="cn(buttonVariants({ variant: 'ghost', size }), props.class)"
      data-slot="pagination-previous"
      v-bind="{ ...$attrs, ...delegatedProps }"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-left" /></slot>
    </PaginationPrev>
  </li>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PaginationPrev, type PaginationPrevProps } from 'reka-ui';

import { type ButtonVariants, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * PaginationPrevious de shadcn-vue (ADR-0013, ADR-0054). Désactivé sur la
 * première page plutôt que masqué : une barre dont les boutons apparaissent et
 * disparaissent change de largeur à chaque clic.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    PaginationPrevProps & { class?: HTMLAttributes['class']; size?: ButtonVariants['size'] }
  >(),
  { size: 'icon' },
);

const delegatedProps = reactiveOmit(props, 'class', 'size');
</script>
