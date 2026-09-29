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
      v-bind="$attrs"
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

<script setup lang="ts">
import { computed, type HTMLAttributes, ref, useTemplateRef } from 'vue';

import { cn } from '@/lib/utils';

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
 * `b-form-file` exposait sous le même nom ; `ModalImport` l'appelle par sa
 * référence, d'où `defineExpose`.
 *
 * Le dépôt d'un fichier sur le cadre est conservé : il affecte les fichiers à
 * l'input et émet `change`, pour que le site d'appel n'ait qu'un chemin.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    accept?: string;
    browseText?: string;
    class?: HTMLAttributes['class'];
    disabled?: boolean;
    id?: string;
    placeholder?: string;
  }>(),
  {
    accept: undefined,
    browseText: 'Browse',
    disabled: false,
    id: undefined,
    placeholder: 'No file chosen',
  },
);

const inputEl = useTemplateRef<HTMLInputElement>('input');
const dragging = ref(false);
const fileName = ref('');

const classes = computed((): string =>
  cn(
    'flex h-9 w-full min-w-0 cursor-pointer items-center overflow-hidden',
    'rounded-sm border border-input bg-card font-sans text-sm text-foreground',
    'transition-colors',
    'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/10',
    'data-dragging:border-ring',
    props.disabled ? 'cursor-not-allowed opacity-50' : '',
    props.class,
  ),
);

function onChange(event: Event): void {
  const files = (event.target as HTMLInputElement).files;
  fileName.value = files && files.length > 0 ? files[0].name : '';
}

function onDrop(event: DragEvent): void {
  dragging.value = false;
  if (
    props.disabled ||
    !inputEl.value ||
    !event.dataTransfer ||
    event.dataTransfer.files.length === 0
  ) {
    return;
  }
  inputEl.value.files = event.dataTransfer.files;
  inputEl.value.dispatchEvent(new Event('change', { bubbles: true }));
}

function reset(): void {
  if (inputEl.value) {
    inputEl.value.value = '';
  }
  fileName.value = '';
}

defineExpose({ reset });
</script>
