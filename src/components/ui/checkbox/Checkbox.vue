<template>
  <input
    :checked="modelValue"
    :class="cn(checkboxClasses, props.class)"
    type="checkbox"
    v-bind="$attrs"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

import { checkboxClasses } from '.';

/*
 * Checkbox — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `<b-form-checkbox>`. Deux écarts avec l'amont, tous deux assumés :
 *
 * - l'amont rend un `<button role="checkbox">` (reka-ui) ; ici c'est un vrai
 *   `<input type="checkbox">` habillé par `accent-color`. La console coche des
 *   lignes de liste au clavier et à la souris, et les specs cliquent l'élément
 *   qui porte le `data-cy` : un input natif fait les deux sans qu'on ait à
 *   réimplémenter l'état indéterminé, le focus ni la touche Espace ;
 * - `v-model` reste la paire `modelValue` / `update:modelValue`, sans
 *   `defineModel` (ADR-0060).
 *
 * La fonction s'appelle `handleChange` et non `onChange` : c'était la parade à
 * G-047, où un `@change` du site d'appel masquait la méthode du même nom. Un
 * `<script setup>` n'y est plus exposé, le nom reste.
 *
 * La valeur est un booléen. `b-form-checkbox` permettait `value` /
 * `unchecked-value` pour stocker autre chose — la console s'en servait pour
 * ranger les chaînes `'true'` et `'false'`, ce qui ne servait rien.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class'];
    modelValue?: boolean;
  }>(),
  { modelValue: false },
);

const emit = defineEmits<{
  (e: 'update:modelValue', payload: boolean): void;
}>();

function handleChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).checked);
}
</script>
