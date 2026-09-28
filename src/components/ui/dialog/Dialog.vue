<template>
  <DialogRoot v-slot="slotProps" data-slot="dialog" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogRoot,
  type DialogRootEmits,
  type DialogRootProps,
  useForwardPropsEmits,
} from 'reka-ui';

/*
 * Dialog de shadcn-vue (ADR-0010, ADR-0054), sur `DialogRoot` de `reka-ui`.
 *
 * L'état d'ouverture appartient au composant appelant : `v-model:open`, ou
 * `:open` et `@update:open`. Le portail dans `<body>`, le blocage du
 * défilement, Échap, le piège de focus et `aria-hidden` sur le reste de la page
 * sont ceux de `reka-ui`.
 *
 * Une modale qui ne doit pas se fermer sur un clic à côté — une suppression —
 * le dit sur son `DialogContent`, comme en amont :
 * `@interact-outside.prevent`. La prop `dismissible` de l'ancienne primitive
 * n'existe plus.
 */
const props = defineProps<DialogRootProps>();
const emits = defineEmits<DialogRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>
