<template>
  <SelectScrollDownButton
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
    data-slot="select-scroll-down-button"
    v-bind="forwarded"
  >
    <slot>
      <i aria-hidden="true" class="fa fa-chevron-down text-xs" />
    </slot>
  </SelectScrollDownButton>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { SelectScrollDownButton, type SelectScrollDownButtonProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/* Affiché par `reka-ui` seulement quand la liste déborde de ce côté. */
const props = defineProps<SelectScrollDownButtonProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>
