<template>
  <div :class="cn('flex flex-col gap-2', props.class)" data-slot="form-item" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

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
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>
