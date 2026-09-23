<template>
  <div :class="classes" data-slot="form-item" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * FormItem — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `b-form-group` : il groupe un libellé, un champ, sa description et
 * son message d'erreur, et porte l'espacement vertical entre les quatre.
 *
 * L'amont a aussi `FormField` et `FormControl`, qui reposent sur `vee-validate`
 * pour propager l'état de validation par contexte. Ils ne sont **pas** repris :
 * la console valide avec Vuelidate, et le site d'appel sait déjà s'il est en
 * erreur. Écrire ici un pont vers une bibliothèque de formulaires qu'on
 * n'utilise pas coûterait plus que les deux lignes qu'il ferait gagner.
 *
 * Le libellé est au-dessus du champ, pas à côté (`label-cols` de
 * bootstrap-vue) : c'est la disposition de l'amont, et celle que la console
 * utilise déjà sur ses autres formulaires.
 */
export default defineComponent({
  name: 'FormItem',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('flex flex-col gap-2');
    },
  },
});
</script>
