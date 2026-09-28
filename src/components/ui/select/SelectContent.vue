<template>
  <SelectPortal>
    <SelectContent
      :class="
        cn(
          'relative z-(--z-floating) min-w-32 overflow-hidden rounded-md',
          'max-h-[min(24rem,var(--reka-select-content-available-height))]',
          'border border-border bg-popover text-popover-foreground shadow-menu outline-none',
          props.class,
        )
      "
      data-slot="select-content"
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <SelectScrollUpButton />
      <SelectViewport
        :class="
          cn(
            'p-1',
            position === 'popper' &&
              'h-(--reka-select-trigger-height) w-full min-w-(--reka-select-trigger-width) scroll-my-1',
          )
        "
      >
        <slot />
      </SelectViewport>
      <SelectScrollDownButton />
    </SelectContent>
  </SelectPortal>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  SelectContent,
  type SelectContentEmits,
  type SelectContentProps,
  SelectPortal,
  SelectViewport,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';

import SelectScrollDownButton from './SelectScrollDownButton.vue';
import SelectScrollUpButton from './SelectScrollUpButton.vue';

/*
 * Le panneau de la liste (ADR-0014, ADR-0054), rendu dans `<body>` par le
 * portail de `reka-ui`. Placé sous le déclencheur comme un menu
 * (`position: 'popper'`), au moins aussi large que lui, à 4 px du bord de
 * l'écran, et plafonné à 24rem comme l'ancien.
 *
 * L'ouverture pose le focus sur l'option retenue (ADR-0014, décision 4) ; les
 * flèches, `Début`, `Fin` et la recherche par les premières lettres sont ceux
 * de `reka-ui`. Tant que la liste est ouverte, le reste de la page ne reçoit
 * pas les clics : le premier clic à côté ferme la liste sans atteindre ce
 * qu'il vise.
 *
 * `z-index` au-dessus de `Dialog` : une liste ouverte depuis une modale est le
 * cas courant (ADR-0018).
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<SelectContentProps & { class?: HTMLAttributes['class'] }>(),
  { align: 'start', collisionPadding: 4, position: 'popper', sideOffset: 4 },
);
const emits = defineEmits<SelectContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
