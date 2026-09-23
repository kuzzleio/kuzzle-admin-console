<template>
  <div :class="classes" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import type { SelectOptionValue } from './context';

/*
 * Select — racine, API publique de shadcn-vue (ADR-0014).
 *
 * Remplace `<b-form-select>` et sa famille. Comme `DropdownMenu` (ADR-0012), la
 * racine ne rend qu'une enveloppe : elle tient la valeur et l'état
 * d'ouverture, mémorise le déclencheur, ferme au clic extérieur et à `Échap`.
 * Le panneau est dans `SelectContent`, son placement dans le mixin
 * `floatingPanel`.
 *
 * `modelValue` / `update:modelValue` portent les noms de l'amont Vue 3, et
 * l'option `model` de Vue 2 fait le pont pour que `<Select v-model="x" />`
 * fonctionne ici sans que les noms changent en phase 4 — même mécanique que
 * `Input`.
 *
 * Les valeurs ne sont pas forcées en chaîne : `<b-form-select>` rendait la
 * valeur telle quelle, et `PerPageSelector` émet un nombre que ses parents
 * comparent à un nombre. Une option porte donc sa valeur d'origine, et seul
 * l'index des libellés est indexé par `String(valeur)`.
 */
export default defineComponent({
  name: 'Select',
  mixins: [classMerge],
  inheritAttrs: false,
  provide(): { selectRoot: unknown } {
    return { selectRoot: this };
  },
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    disabled: {
      default: false,
      type: Boolean,
    },
    modelValue: {
      default: null,
      type: [String, Number] as PropType<SelectOptionValue | null>,
    },
    // `undefined` et non `false` : c'est ce qui distingue « l'appelant ne pilote
    // pas l'ouverture » de « l'appelant la veut fermée ».
    open: {
      default: undefined,
      type: Boolean,
    },
  },
  data() {
    // Déclaré avant le retour : `{} as Record<…>` est une assertion de type, que
    // la règle `consistent-type-assertions` refuse.
    const labels: Record<string, string> = {};
    return {
      contentEl: null as HTMLElement | null,
      // Les libellés survivent à la fermeture, alors que les `SelectItem` qui
      // les déclarent sont démontés avec le panneau. Sans cet index, le
      // déclencheur n'aurait plus rien à afficher dès la première fermeture.
      labels,
      triggerEl: null as HTMLElement | null,
      uncontrolledOpen: false,
    };
  },
  computed: {
    classes(): string {
      return this.mergeClasses('inline-block');
    },
    isOpen(): boolean {
      return this.open === undefined ? this.uncontrolledOpen : this.open;
    },
  },
  mounted() {
    // En phase de capture, pour la même raison que `DropdownMenu` : un clic sur
    // un élément qui se retire du DOM au `click` ne remonterait jamais jusqu'à
    // `document` en phase de bouillonnement.
    document.addEventListener('click', this.onDocumentClick, true);
    document.addEventListener('keydown', this.onDocumentKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentClick, true);
    document.removeEventListener('keydown', this.onDocumentKeydown);
  },
  methods: {
    setOpen(open: boolean): void {
      if (this.disabled && open) {
        return;
      }
      this.uncontrolledOpen = open;
      this.$emit('update:open', open);
    },
    toggle(): void {
      this.setOpen(!this.isOpen);
    },
    close(options: { focusTrigger?: boolean } = {}): void {
      if (!this.isOpen) {
        return;
      }
      this.setOpen(false);
      if (options.focusTrigger) {
        this.$nextTick(() => this.triggerEl?.focus());
      }
    },
    select(value: SelectOptionValue): void {
      this.$emit('update:modelValue', value);
      this.close({ focusTrigger: true });
    },
    registerLabel(value: SelectOptionValue, label: string): void {
      this.labels[String(value)] = label;
    },
    setTrigger(el: HTMLElement | null): void {
      this.triggerEl = el;
    },
    setContent(el: HTMLElement | null): void {
      this.contentEl = el;
    },
    onDocumentKeydown(event: KeyboardEvent): void {
      if (this.isOpen && event.key === 'Escape') {
        this.close({ focusTrigger: true });
      }
    },
    onDocumentClick(event: MouseEvent): void {
      if (!this.isOpen) {
        return;
      }
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      // Le panneau est déplacé dans `<body>` : il n'est plus descendant de
      // `$el`, il faut donc l'interroger séparément.
      const inside =
        (this.$el as HTMLElement).contains(target) || !!this.contentEl?.contains(target);
      if (!inside) {
        this.setOpen(false);
      }
    },
  },
});
</script>
