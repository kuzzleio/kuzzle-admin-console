<template>
  <TabsList
    :class="
      cn(
        'flex flex-row gap-1 border-b border-border',
        'aria-[orientation=vertical]:shrink-0 aria-[orientation=vertical]:flex-col aria-[orientation=vertical]:border-r aria-[orientation=vertical]:border-b-0 aria-[orientation=vertical]:pr-2',
        props.class,
      )
    "
    data-slot="tabs-list"
    v-bind="forwarded"
  >
    <slot />
  </TabsList>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TabsList, type TabsListProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * TabsList de shadcn-vue (ADR-0017, ADR-0054) : `role="tablist"` et
 * `aria-orientation` sont posés par `reka-ui` — la liste n'a pas de
 * `data-orientation`, ses variantes lisent donc `aria-orientation`. La barre
 * horizontale est la règle sans variante, pour qu'un `border-b-0` du site
 * d'appel la remplace au lieu de s'y ajouter.
 *
 * Écart de DA : l'amont dessine une pastille grise où l'onglet courant se
 * détache en carte ; la console garde un filet sous la barre, et l'onglet
 * courant le souligne en couleur primaire (DESIGN.md).
 */
const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>
