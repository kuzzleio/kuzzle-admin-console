<template>
  <SplitterResizeHandle
    :aria-orientation="group.direction.value === 'horizontal' ? 'vertical' : 'horizontal'"
    :class="
      cn(
        'relative z-2 flex shrink-0 items-center justify-center',
        'bg-border transition-colors hover:bg-muted-foreground',
        'data-[state=drag]:bg-muted-foreground',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'h-full w-1.5 cursor-col-resize',
        'data-[orientation=vertical]:h-1.5 data-[orientation=vertical]:w-full data-[orientation=vertical]:cursor-row-resize',
        props.class,
      )
    "
    data-slot="resizable-handle"
    v-bind="forwarded"
  >
    <div
      v-if="props.withHandle"
      class="h-8 w-0.5 rounded-full bg-background/70 [[data-orientation=vertical]>&]:h-0.5 [[data-orientation=vertical]>&]:w-8"
    >
      <slot />
    </div>
  </SplitterResizeHandle>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  injectSplitterGroupContext,
  SplitterResizeHandle,
  type SplitterResizeHandleEmits,
  type SplitterResizeHandleProps,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * ResizableHandle de shadcn-vue (ADR-0021, ADR-0054) : `role="separator"`,
 * focusable, déplaçable aux flèches, posés par `reka-ui`. Le nom vient du site
 * d'appel, en `aria-label`.
 *
 * Écarts, tous hérités de la primitive précédente :
 *
 * - **DA** : une barre de 6 px, et non le filet d'1 px de l'amont ; la
 *   poignée (`with-handle`) est un trait, pas l'icône lucide `GripVertical`
 *   (DESIGN.md) ;
 * - **zone de saisie de 24 px** (WCAG 2.5.8). `reka-ui` ne regarde pas où le
 *   pointeur tombe dans le DOM : il compare sa position au rectangle de la
 *   poignée, élargi de `hit-area-margins`. 9 px de chaque côté d'une barre de
 *   6 font les 24 ; au doigt, la marge de l'amont (15 px) les dépasse déjà ;
 * - **`aria-orientation`** : `reka-ui` n'en pose pas, et un `separator` sans
 *   elle est annoncé horizontal. Une poignée entre deux panneaux côte à côte
 *   est verticale.
 *
 * Une poignée cachée par une classe (`hidden`) reste enregistrée, avec un
 * rectangle nul en haut à gauche de la page : `reka-ui` y capte les appuis
 * dans sa marge. Pour la retirer sous un point de rupture, un `v-if`
 * (G-099).
 */
const props = withDefaults(
  defineProps<
    SplitterResizeHandleProps & { class?: HTMLAttributes['class']; withHandle?: boolean }
  >(),
  { hitAreaMargins: () => ({ coarse: 15, fine: 9 }), tabindex: 0 },
);
const emits = defineEmits<SplitterResizeHandleEmits>();

const group = injectSplitterGroupContext();
const delegatedProps = reactiveOmit(props, 'class', 'withHandle');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
