<template>
  <label :class="cn('inline-flex cursor-pointer items-center gap-2', props.class)">
    <input
      :checked="modelValue"
      class="peer sr-only"
      role="switch"
      type="checkbox"
      v-bind="$attrs"
      @change="onChange"
    />
    <span aria-hidden="true" :class="trackClasses">
      <span :class="thumbClasses" />
    </span>
    <span v-if="$slots.default" class="font-sans text-sm text-foreground"><slot /></span>
  </label>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/*
 * Switch — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `<b-form-checkbox switch>`. C'est bien un interrupteur et non une
 * case à cocher : la bascule « Form view / JSON view » change de vue, elle ne
 * sélectionne rien, et `Checkbox` aurait changé ce que le contrôle raconte.
 *
 * Comme `Checkbox`, l'implémentation est un `<input type="checkbox">` natif —
 * ici visuellement masqué (`sr-only`) et doublé d'une piste dessinée, pilotée
 * par la variante `peer-checked:`. L'amont rend un `<button role="switch">` ;
 * l'input natif donne le focus, la touche Espace et l'association au `<label>`
 * sans les réécrire, et `role="switch"` porte l'information au lecteur d'écran.
 *
 * Le libellé est dans le slot par défaut, comme le faisait `b-form-checkbox` :
 * il est **dans** le `<label>`, donc cliquable, sans que le site d'appel ait à
 * apparier un `for` et un `id`.
 *
 * Le composant s'appelle `Switch` — le nom de l'amont — mais le site d'appel
 * l'importe sous `UiSwitch` : `switch` est une balise SVG (G-020).
 */
defineOptions({ name: 'UiSwitch', inheritAttrs: false });

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

const trackClasses = [
  'inline-flex h-5 w-9 shrink-0 items-center rounded-full',
  'border border-transparent bg-input p-0.5',
  'transition-colors',
  'peer-checked:bg-primary',
  // La pastille est un **enfant** de la piste, pas un frère de l'input :
  // `peer-checked:` seul ne l'atteindrait pas (le sélecteur généré est un
  // combinateur de frères). `*:` vise l'enfant direct depuis la piste.
  'peer-checked:*:translate-x-4',
  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
].join(' ');
const thumbClasses = [
  'pointer-events-none block size-4 rounded-full bg-card shadow-sm',
  'transition-transform',
].join(' ');

function onChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).checked);
}
</script>
