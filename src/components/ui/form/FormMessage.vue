<template>
  <p :class="classes" aria-live="assertive" data-slot="form-message" role="alert" v-bind="$attrs">
    <i aria-hidden="true" class="fas fa-exclamation-circle me-1" />
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
 *
 * L'icône double la couleur : une erreur qui ne se signale que par le rouge
 * ne se voit pas pour tout le monde. `b-form-group` la posait dans le champ ;
 * elle est ici dans le message, qui la porte pour tous les formulaires
 * (E-08 de la comparaison v4 / v5).
 */
export default defineComponent({
  name: 'FormMessage',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('font-sans text-sm text-destructive');
    },
  },
});
</script>
