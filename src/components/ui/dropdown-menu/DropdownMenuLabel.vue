<template>
  <DropdownMenuLabel
    :id="labelId"
    :class="
      cn(
        'px-2 py-1.5 font-sans text-xs font-semibold text-muted-foreground',
        inset && 'pl-8',
        props.class,
      )
    "
    data-slot="dropdown-menu-label"
    v-bind="delegatedProps"
  >
    <slot />
  </DropdownMenuLabel>
</template>

<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'reka-ui';

import { cn } from '@/lib/utils';
import { dropdownMenuGroupKey } from './group';

/*
 * DropdownMenuLabel de shadcn-vue (ADR-0054). C'est du texte : le lecteur
 * d'écran l'annonce parce que le groupe le désigne par `aria-labelledby`.
 * Placé hors d'un groupe, il reste un simple intitulé visuel.
 */
const props = defineProps<
  DropdownMenuLabelProps & { class?: HTMLAttributes['class']; inset?: boolean }
>();

const delegatedProps = reactiveOmit(props, 'class', 'inset');
const labelId = inject(dropdownMenuGroupKey, undefined);
</script>
