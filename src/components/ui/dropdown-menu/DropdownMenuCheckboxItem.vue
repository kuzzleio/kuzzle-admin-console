<template>
  <DropdownMenuCheckboxItem
    :class="cn(itemClasses({ inset: true }), props.class)"
    data-slot="dropdown-menu-checkbox-item"
    v-bind="forwarded"
    @select="keepOpen"
  >
    <span aria-hidden="true" class="absolute left-2 flex w-4 justify-center">
      <i :class="['far', modelValue === true ? 'fa-check-square' : 'fa-square']" />
    </span>
    <slot />
  </DropdownMenuCheckboxItem>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemEmits,
  type DropdownMenuCheckboxItemProps,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';
import { itemClasses } from './item-classes';

/*
 * DropdownMenuCheckboxItem de shadcn-vue (ADR-0054). La valeur passe par
 * `v-model`, comme en amont (`modelValue`), et `reka-ui` annonce
 * `role="menuitemcheckbox"` et `aria-checked`.
 *
 * La case est dessinée dans les deux états, comme en v4 : une coche seule ne
 * laisse rien voir d'un élément décoché (E-12 de la comparaison v4 / v5).
 *
 * **Le menu ne se ferme pas quand on coche** : cocher n'est pas choisir, et
 * fermer le menu retirerait de l'écran le retour visuel qu'on vient de
 * déclencher — le filtre par rôle se coche plusieurs fois de suite. `reka-ui`
 * ferme par défaut ; `select` est donc annulé ici, après avoir été transmis.
 */
const props = defineProps<DropdownMenuCheckboxItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DropdownMenuCheckboxItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);

function keepOpen(event: Event): void {
  event.preventDefault();
}
</script>
