<template>
  <DropdownMenuItem
    :class="cn(itemClasses({ inset, variant }), props.class)"
    data-slot="dropdown-menu-item"
    v-bind="forwarded"
  >
    <slot />
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuItem,
  type DropdownMenuItemEmits,
  type DropdownMenuItemProps,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';
import { itemClasses } from './item-classes';

/*
 * DropdownMenuItem de shadcn-vue (ADR-0012, ADR-0054).
 *
 * Le rendu par défaut est un `<div role="menuitem">` ; un élément qui navigue
 * prend `:as="RouterLink"` avec `:to`, ou `as="a"` avec `href` (G-085).
 * `@select` est émis au clic comme à `Entrée`, puis le menu se ferme — sauf si
 * le site d'appel appelle `preventDefault()`. Un élément `disabled` n'émet
 * rien et est sauté par les flèches.
 */
const props = withDefaults(
  defineProps<
    DropdownMenuItemProps & {
      class?: HTMLAttributes['class'];
      inset?: boolean;
      variant?: 'default' | 'destructive';
    }
  >(),
  { variant: 'default' },
);
const emits = defineEmits<DropdownMenuItemEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'inset', 'variant');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
