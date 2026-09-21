<template>
  <span data-slot="select-item-text" v-bind="$attrs"><slot /></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/*
 * SelectItemText — API publique de shadcn-vue (ADR-0014).
 *
 * `SelectItem` l'inclut lui-même, comme en amont : un site d'appel écrit
 * `<SelectItem value="x">Libellé</SelectItem>` et n'a pas à y penser. Il est
 * exporté parce que l'amont l'exporte.
 *
 * Contrairement à l'amont, ce n'est pas lui qui déclare le libellé à la racine
 * — `SelectItem` le fait, à partir du texte rendu. Un composant de moins à
 * connecter, et le libellé reste juste même quand le slot contient autre chose
 * que du texte nu.
 */
export default defineComponent({
  name: 'SelectItemText',
  inheritAttrs: false,
});
</script>
