<template>
  <TabsTrigger
    :class="
      cn(
        'inline-flex cursor-pointer items-center gap-2',
        'appearance-none border-0 bg-transparent',
        'px-3 py-2',
        'font-sans text-sm font-medium text-muted-foreground',
        'transition-colors outline-none hover:text-foreground',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=active]:font-semibold data-[state=active]:text-foreground',
        'data-[state=active]:data-[orientation=horizontal]:-mb-px data-[state=active]:data-[orientation=horizontal]:border-b-2 data-[state=active]:data-[orientation=horizontal]:border-primary',
        'data-[state=active]:data-[orientation=vertical]:-mr-2 data-[state=active]:data-[orientation=vertical]:border-r-2 data-[state=active]:data-[orientation=vertical]:border-primary',
        props.class,
      )
    "
    data-slot="tabs-trigger"
    v-bind="forwarded"
  >
    <slot />
  </TabsTrigger>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * TabsTrigger de shadcn-vue (ADR-0017, ADR-0054) : un `<button role="tab">`
 * dont `reka-ui` gère `aria-selected`, `aria-controls` et le `tabindex`
 * itinérant. Le repère de l'onglet courant suit l'orientation de la barre.
 *
 * Le preflight n'étant pas chargé (ADR-0008), le fond et la bordure d'un
 * `<button>` sont posés explicitement (G-021).
 */
const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>
