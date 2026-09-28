<template>
  <DropdownMenuRoot v-slot="slotProps" data-slot="dropdown-menu" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DropdownMenuRoot>
</template>

<script setup lang="ts">
import {
  DropdownMenuRoot,
  type DropdownMenuRootEmits,
  type DropdownMenuRootProps,
  useForwardPropsEmits,
} from 'reka-ui';

/*
 * DropdownMenu de shadcn-vue (ADR-0012, ADR-0054), sur `DropdownMenuRoot`.
 *
 * La racine ne rend aucun élément, comme en amont : un `data-cy` ou une classe
 * se posent sur le déclencheur ou sur un élément du site d'appel.
 *
 * **Un écart avec l'amont : `modal` vaut `false` par défaut.** Un menu modal
 * rend le reste de la page inerte — `pointer-events: none` sur `<body>` — et
 * enferme le focus. ADR-0012 l'a écarté : un menu n'est pas une modale, aucun
 * fond assombri ne signale qu'on y est enfermé, et un clic à côté doit fermer
 * le menu *et* atteindre ce qu'il vise. Un site d'appel qui veut l'autre
 * comportement passe `:modal="true"`.
 */
const props = withDefaults(defineProps<DropdownMenuRootProps>(), {
  modal: false,
  open: undefined,
});
const emits = defineEmits<DropdownMenuRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>
