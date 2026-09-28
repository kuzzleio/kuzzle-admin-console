<template>
  <SelectScrollUpButton
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
    data-slot="select-scroll-up-button"
    v-bind="forwarded"
  >
    <slot>
      <i aria-hidden="true" class="fa fa-chevron-up text-xs" />
    </slot>
  </SelectScrollUpButton>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { SelectScrollUpButton, type SelectScrollUpButtonProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/* Affiché par `reka-ui` seulement quand la liste déborde de ce côté. */
const props = defineProps<SelectScrollUpButtonProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>
