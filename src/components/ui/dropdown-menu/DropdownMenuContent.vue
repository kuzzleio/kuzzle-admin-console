<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      :class="
        cn(
          'z-(--z-floating) min-w-[max(8rem,var(--reka-dropdown-menu-trigger-width))]',
          'max-h-(--reka-dropdown-menu-content-available-height) overflow-y-auto rounded-md',
          'border border-border bg-popover text-popover-foreground',
          'p-1 shadow-menu outline-none',
          props.class,
        )
      "
      data-slot="dropdown-menu-content"
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuContent,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps,
  DropdownMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * Le panneau du menu (ADR-0012, ADR-0054), rendu dans `<body>` par le portail
 * de `reka-ui`. Le placement — sous le déclencheur, basculé au-dessus quand le
 * bas manque de place, plafonné à la hauteur disponible — et la navigation au
 * clavier (flèches, `Début`, `Fin`, recherche par la première lettre) sont
 * ceux de `reka-ui`.
 *
 * Le panneau est au moins aussi large que son déclencheur et garde 4 px de
 * marge au bord de l'écran, comme l'ancien, et passe au-dessus d'une modale : un menu ouvert *depuis* une
 * modale est le cas courant (ADR-0018).
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<DropdownMenuContentProps & { class?: HTMLAttributes['class'] }>(),
  { align: 'start', collisionPadding: 4, sideOffset: 4 },
);
const emits = defineEmits<DropdownMenuContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
