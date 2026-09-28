<template>
  <SelectTrigger
    :class="
      cn(
        'flex h-9 w-full items-center justify-between gap-2',
        'cursor-pointer whitespace-nowrap',
        'rounded-sm border border-input bg-card',
        'px-3 py-2',
        'font-sans text-sm leading-none text-foreground data-placeholder:text-muted-foreground',
        'transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/10',
        'aria-invalid:border-destructive',
        'disabled:cursor-not-allowed disabled:bg-subtle disabled:text-muted-foreground',
        '*:data-[slot=select-value]:truncate',
        props.class,
      )
    "
    data-slot="select-trigger"
    v-bind="forwarded"
  >
    <slot />
    <SelectIcon as-child>
      <i class="fa fa-chevron-down ml-2 text-xs opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { SelectIcon, SelectTrigger, type SelectTriggerProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * SelectTrigger de shadcn-vue (ADR-0014, ADR-0054) : un `<button
 * role="combobox">` — une liste déroulante n'est pas un menu, et le dit.
 * `type="button"` est posé par `reka-ui` : dans un `<form>`, il ne soumet pas.
 *
 * Sans `size` : la console n'a qu'une hauteur de champ (h-9).
 */
const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>
