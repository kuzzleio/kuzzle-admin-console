<template>
  <label :class="wrapperClasses">
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

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

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
 * `v-model` passe par l'option `model` de Vue 2 (G-012).
 *
 * Le composant s'appelle `Switch` — le nom de l'amont — mais s'enregistre sous
 * `UiSwitch` dans les templates : `switch` est une balise SVG et Vue 2 donne la
 * priorité aux tags réservés, en comparant en minuscules (G-020).
 */
export default defineComponent({
  name: 'UiSwitch',
  mixins: [classMerge],
  inheritAttrs: false,
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    modelValue: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    wrapperClasses(): string {
      return this.mergeClasses('inline-flex cursor-pointer items-center gap-2');
    },
    trackClasses(): string {
      return [
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
    },
    thumbClasses(): string {
      return [
        'pointer-events-none block size-4 rounded-full bg-background shadow-sm',
        'transition-transform',
      ].join(' ');
    },
  },
  methods: {
    onChange(event: Event): void {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).checked);
    },
  },
});
</script>
