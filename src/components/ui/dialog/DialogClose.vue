<template>
  <button :class="classes" data-slot="dialog-close" type="button" v-bind="$attrs" @click="close">
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * DialogClose — API publique de shadcn-vue (ADR-0010).
 *
 * Ferme la modale qui le contient, par le même chemin qu'Échap :
 * `update:open` émis par `Dialog`. Un site d'appel qui fait du ménage à la
 * fermeture le fait donc pour les deux gestes à la fois.
 *
 * La fermeture ne passe pas par `dismissible`, qui ne vise que le clic sur le
 * fond : une croix ne se clique pas par accident.
 *
 * Sans preflight (ADR-0008), un `<button>` garde la bordure et le fond du
 * navigateur : les deux sont retirés explicitement (G-021).
 */
export default defineComponent({
  name: 'DialogClose',
  mixins: [classMerge],
  inject: {
    dialog: { default: null },
  },
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('appearance-none border-0 bg-transparent p-0 cursor-pointer');
    },
  },
  methods: {
    close(): void {
      (this.dialog as { requestClose: (reason: string) => void } | null)?.requestClose('close');
    },
  },
});
</script>
