<template>
  <li data-slot="pagination-item">
    <PaginationListItem
      :class="cn(buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }), props.class)"
      data-slot="pagination-link"
      v-bind="{ ...$attrs, ...delegatedProps }"
    >
      <slot />
    </PaginationListItem>
  </li>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PaginationListItem, type PaginationListItemProps } from 'reka-ui';

import { type ButtonVariants, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * PaginationItem de shadcn-vue (ADR-0013, ADR-0054) : un `<button>` qui porte
 * `aria-current="page"` sur la page courante et le numéro dans `value` —
 * l'ancrage de `cy.paginationPage()`.
 *
 * Dans un `<li>`, voir `PaginationContent`.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    PaginationListItemProps & {
      class?: HTMLAttributes['class'];
      isActive?: boolean;
      size?: ButtonVariants['size'];
    }
  >(),
  { size: 'icon' },
);

const delegatedProps = reactiveOmit(props, 'class', 'isActive', 'size');
</script>
