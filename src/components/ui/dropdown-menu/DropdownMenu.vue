<template>
  <div :class="classes" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * DropdownMenu — racine, API publique de shadcn-vue (ADR-0012).
 *
 * Remplace `<b-dropdown>` et sa famille. La racine ne rend qu'une enveloppe :
 * elle tient l'état d'ouverture, mémorise le déclencheur, et ferme le menu au
 * clic extérieur. Le panneau, son placement et la navigation au clavier sont
 * dans `DropdownMenuContent`.
 *
 * **Contrôlé ou non, au choix du site d'appel.** `b-dropdown` ne connaissait que
 * le mode non contrôlé ; shadcn-vue expose `v-model:open`. Les deux coexistent
 * ici : sans prop `open`, la racine gère son état ; avec, c'est l'appelant qui
 * décide et la racine ne fait qu'émettre. Aucun site d'appel n'a besoin du mode
 * contrôlé aujourd'hui — il est là parce que c'est l'API de l'amont, et qu'un
 * menu dont la fermeture doit attendre une confirmation en aura besoin.
 *
 * Le contexte fourni aux descendants est **l'instance elle-même**, et non un
 * objet littéral comme dans `Dialog` : `provide()` n'est évalué qu'une fois en
 * Vue 2, et un objet littéral fige les valeurs qu'il contient. Les enfants
 * doivent lire `isOpen` au fil de l'eau, donc ils lisent une propriété
 * réactive d'un composant vivant.
 */
export default defineComponent({
  name: 'DropdownMenu',
  mixins: [classMerge],
  inheritAttrs: false,
  provide(): { dropdownMenu: unknown } {
    return { dropdownMenu: this };
  },
  props: {
    // `undefined` et non `false` : c'est ce qui distingue « l'appelant ne pilote
    // pas l'ouverture » de « l'appelant la veut fermée ».
    open: {
      default: undefined,
      type: Boolean,
    },
  },
  data() {
    return {
      contentEl: null as HTMLElement | null,
      pendingFocus: null as 'first' | 'last' | null,
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
    // En phase de capture : un clic sur un élément qui se retire du DOM au
    // `click` (une ligne de tableau, un onglet) ne remonterait jamais jusqu'à
    // `document` en phase de bouillonnement, et le menu resterait ouvert.
    document.addEventListener('click', this.onDocumentClick, true);
    document.addEventListener('keydown', this.onDocumentKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentClick, true);
    document.removeEventListener('keydown', this.onDocumentKeydown);
  },
  methods: {
    setOpen(open: boolean): void {
      this.uncontrolledOpen = open;
      this.$emit('update:open', open);
    },
    toggle(): void {
      // Ouverture à la souris : pas de focus à poser. Le clavier passe par
      // `pendingFocus`, que le déclencheur renseigne avant d'ouvrir.
      this.pendingFocus = null;
      this.setOpen(!this.isOpen);
    },
    /** Ferme, et rend le focus au déclencheur : sans ça, une fermeture au
     * clavier renvoie le focus au `<body>` et la navigation repart de zéro. */
    close(options: { focusTrigger?: boolean } = {}): void {
      if (!this.isOpen) {
        return;
      }
      this.setOpen(false);
      if (options.focusTrigger) {
        this.$nextTick(() => this.triggerEl?.focus());
      }
    },
    setTrigger(el: HTMLElement | null): void {
      this.triggerEl = el;
    },
    setContent(el: HTMLElement | null): void {
      this.contentEl = el;
    },
    // Échap est écouté sur le document et non sur le panneau : le focus peut
    // être ailleurs — l'utilisateur a ouvert le menu à la souris sans jamais
    // le prendre — et un menu qui ne se ferme qu'avec le focus dedans ne se
    // ferme pas.
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
      // Le panneau est déplacé dans `<body>` (ADR-0012) : il n'est plus
      // descendant de `$el`, il faut donc l'interroger séparément.
      const inside =
        (this.$el as HTMLElement).contains(target) || !!this.contentEl?.contains(target);
      if (!inside) {
        this.setOpen(false);
      }
    },
  },
});
</script>
