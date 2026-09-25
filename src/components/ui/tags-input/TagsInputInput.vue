<template>
  <input
    :class="classes"
    data-slot="tags-input-input"
    :disabled="tagsInput.disabled"
    :placeholder="placeholder"
    type="text"
    :value="draft"
    v-bind="$attrs"
    @input="draft = ($event.target as HTMLInputElement).value"
    @keydown.enter.prevent="commit"
    @keydown.delete="onBackspace"
    @blur="commit"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { tagsInputContext } from './context';

/*
 * TagsInputInput — API publique de shadcn-vue (ADR-0019).
 *
 * La saisie en cours est locale : elle ne devient une étiquette qu'à `Entrée`
 * ou à la perte du focus. `b-form-tags` ajoutait aussi à la virgule et à
 * l'espace ; ce n'est pas repris, les noms de contrôleurs de Kuzzle n'en
 * contiennent pas et une valeur coupée en deux est un piège silencieux.
 */
export default defineComponent({
  name: 'TagsInputInput',
  mixins: [classMerge, tagsInputContext],
  inheritAttrs: false,
  props: {
    placeholder: {
      default: '',
      type: String,
    },
  },
  data() {
    return {
      draft: '',
    };
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'min-w-32 flex-1 appearance-none border-0 bg-transparent',
        'font-sans text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed',
      );
    },
  },
  methods: {
    commit(): void {
      if (this.draft.trim() === '') {
        return;
      }
      this.tagsInput.add(this.draft);
      this.draft = '';
    },
    onBackspace(): void {
      if (this.draft === '') {
        this.tagsInput.removeLast();
      }
    },
  },
});
</script>
