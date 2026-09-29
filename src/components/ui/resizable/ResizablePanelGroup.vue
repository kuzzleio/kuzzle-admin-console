<template>
  <SplitterGroup
    v-slot="slotProps"
    :class="cn('flex h-full w-full data-[orientation=vertical]:flex-col', props.class)"
    data-slot="resizable-panel-group"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </SplitterGroup>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  SplitterGroup,
  type SplitterGroupEmits,
  type SplitterGroupProps,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * ResizablePanelGroup de shadcn-vue (ADR-0021, ADR-0054) : le glisser, le
 * clavier et le calcul des tailles sont ceux de `reka-ui`. Le groupe porte
 * les tailles et les émet par `layout`, dans l'unité de chaque panneau ; le
 * site d'appel décide s'il les persiste.
 *
 * `reka-ui` écrit `flex-direction` en style en ligne, d'après `direction` : un
 * `flex-col` du site d'appel sous un point de rupture ne prend qu'avec `!`
 * (G-099).
 */
const props = defineProps<SplitterGroupProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<SplitterGroupEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
