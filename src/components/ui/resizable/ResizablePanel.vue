<template>
  <SplitterPanel
    :ref="forwardRef"
    v-slot="slotProps"
    data-slot="resizable-panel"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </SplitterPanel>
</template>

<script setup lang="ts">
import {
  SplitterPanel,
  type SplitterPanelEmits,
  type SplitterPanelProps,
  useForwardExpose,
  useForwardPropsEmits,
} from 'reka-ui';

/*
 * ResizablePanel de shadcn-vue (ADR-0021, ADR-0054). La taille vient de
 * `default-size`, `min-size` et `max-size`, en pourcentage du groupe ou en
 * pixels avec `size-unit="px"` — l'unité que `Data` persiste.
 *
 * `reka-ui` écrit en style en ligne `flex: <taille> 1 0` et
 * `overflow: hidden` : aucune classe du site d'appel ne les remplace sans
 * `!` (G-099).
 */
const props = defineProps<SplitterPanelProps>();
const emits = defineEmits<SplitterPanelEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const { forwardRef } = useForwardExpose();
</script>
