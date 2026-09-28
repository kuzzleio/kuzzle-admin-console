<template>
  <DialogClose data-slot="dialog-close" v-bind="props">
    <slot />
  </DialogClose>
</template>

<script setup lang="ts">
import { DialogClose, type DialogCloseProps } from 'reka-ui';

/*
 * DialogClose de shadcn-vue (ADR-0054). Ferme la modale qui le contient, par
 * le même chemin qu'Échap : `update:open` émis par `Dialog`.
 */
const props = defineProps<DialogCloseProps>();
</script>
