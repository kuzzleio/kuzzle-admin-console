<template>
  <label
    :class="classes"
    :data-dragging="dragging || undefined"
    @dragenter.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <input
      :id="id"
      ref="input"
      :accept="accept"
      class="sr-only"
      :disabled="disabled"
      type="file"
      v-bind="inputAttrs"
      @change="onChange"
    />
    <span class="min-w-0 flex-1 truncate px-3" :class="fileName ? '' : 'text-muted-foreground'">
      {{ fileName || placeholder }}
    </span>
    <span
      aria-hidden="true"
      class="flex items-center self-stretch border-l border-input bg-muted px-3 font-medium"
    >
      {{ browseText }}
    </span>
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * FileInput — champ fichier dont tout le texte est celui de la console.
 *
 * Un `<input type="file">` natif dessine son bouton et son « aucun fichier
 * choisi » dans la langue du navigateur, au milieu d'une interface en anglais
 * (E-15 de docs/comparaison-v4-v5/ecarts.md). Ici l'input reste le vrai
 * contrôle — focusable, lu par les lecteurs d'écran, piloté par
 * `cy.selectFile` —, mais il est masqué (`sr-only`) et c'est le `<label>` qui
 * s'affiche : un clic dessus ouvre le sélecteur, comme sur `b-form-file`.
 *
 * shadcn-vue n'a pas de composant fichier : l'API reprend celle d'`Input`.
 * Les attributs du site d'appel (`data-cy`, `@change`…) vont sur l'input ;
 * seule la classe va sur le cadre. `reset()` vide la sélection, ce que
 * `b-form-file` exposait sous le même nom.
 *
 * Le dépôt d'un fichier sur le cadre est conservé : il affecte les fichiers à
 * l'input et émet `change`, pour que le site d'appel n'ait qu'un chemin.
 */
export default defineComponent({
  name: 'FileInput',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    accept: { default: undefined, type: String },
    browseText: { default: 'Browse', type: String },
    disabled: { default: false, type: Boolean },
    id: { default: undefined, type: String },
    placeholder: { default: 'No file chosen', type: String },
  },
  data() {
    return { dragging: false, fileName: '' };
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'flex h-9 w-full min-w-0 cursor-pointer items-center overflow-hidden',
        'rounded-sm border border-input bg-card font-sans text-sm text-foreground',
        'transition-colors',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        'data-dragging:border-ring',
        this.disabled ? 'cursor-not-allowed opacity-50' : '',
      );
    },
    inputAttrs(): Record<string, unknown> {
      const { class: _class, ...attrs } = this.$attrs;
      return attrs;
    },
  },
  methods: {
    onChange(event: Event): void {
      const files = (event.target as HTMLInputElement).files;
      this.fileName = files && files.length > 0 ? files[0].name : '';
    },
    onDrop(event: DragEvent): void {
      this.dragging = false;
      const input = this.$refs.input as HTMLInputElement;
      if (this.disabled || !event.dataTransfer || event.dataTransfer.files.length === 0) {
        return;
      }
      input.files = event.dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    reset(): void {
      (this.$refs.input as HTMLInputElement).value = '';
      this.fileName = '';
    },
  },
});
</script>
