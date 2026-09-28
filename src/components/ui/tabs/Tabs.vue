<template>
  <TabsRoot
    :class="
      cn(
        'flex gap-2 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row',
        props.class,
      )
    "
    data-slot="tabs"
    v-bind="forwarded"
  >
    <slot />
  </TabsRoot>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TabsRoot, type TabsRootEmits, type TabsRootProps, useForwardPropsEmits } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * Tabs de shadcn-vue (ADR-0017, ADR-0054). Un onglet se désigne par une
 * valeur, pas par un rang ; les flèches, Début et Fin déplacent la sélection,
 * et la barre n'est qu'un arrêt de tabulation — c'est `reka-ui` qui le fait.
 *
 * **Un écart de comportement avec la primitive précédente**, que le site
 * d'appel porte : sans `default-value` ni `v-model`, `reka-ui` ne choisit
 * aucun onglet, là où la nôtre prenait le premier monté. Chaque site d'appel
 * désigne son onglet de départ.
 *
 * `unmount-on-hide` (vrai par défaut) démonte le contenu d'un panneau caché ;
 * `:unmount-on-hide="false"` le garde monté et masqué, pour un panneau qui
 * porte un état que son hôte ne sait pas restaurer (ADR-0021).
 */
const props = defineProps<TabsRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<TabsRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
