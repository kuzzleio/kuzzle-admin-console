<template>
  <TagsInputItem
    :class="
      cn(
        'inline-flex max-w-full items-center gap-1 rounded-pill',
        'bg-secondary px-2 py-0.5',
        'font-sans text-sm text-secondary-foreground',
        'data-[state=active]:ring-2 data-[state=active]:ring-ring data-[state=active]:ring-offset-2 data-[state=active]:ring-offset-background',
        props.class,
      )
    "
    data-slot="tags-input-item"
    :title="String(props.value)"
    v-bind="forwardedProps"
  >
    <slot />
  </TagsInputItem>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TagsInputItem, type TagsInputItemProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * TagsInputItem de shadcn-vue (ADR-0019, ADR-0054).
 *
 * `title` porte la valeur, en plus de l'amont : une étiquette tronquée reste
 * lisible, et c'est ce à quoi la commande Cypress `removeFormTag` s'accroche.
 * L'anneau désigne l'étiquette choisie au clavier (flèches, Retour arrière).
 */
const props = defineProps<TagsInputItemProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwardedProps = useForwardProps(delegatedProps);
</script>
