<template>
  <p
    :class="classes"
    aria-live="assertive"
    data-slot="form-message"
    role="alert"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * Message d'erreur d'un champ. Remplace `invalid-feedback` de `b-form-group`.
 *
 * `role="alert"` et `aria-live` sont portés par la primitive : bootstrap-vue
 * les posait, et une erreur de saisie qui n'est pas annoncée n'existe pas pour
 * qui n'a pas l'écran.
 *
 * Le composant ne s'affiche que s'il est rendu : c'est au site d'appel de le
 * mettre sous `v-if`. Un message d'erreur vide mais présent dans le DOM est
 * exactement ce qui fait passer une spec qui devrait échouer.
 */
export default defineComponent({
  name: 'FormMessage',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:font-sans tw:text-sm tw:text-destructive');
    },
  },
});
</script>
