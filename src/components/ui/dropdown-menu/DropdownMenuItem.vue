<template>
  <component
    :is="as"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="classes"
    data-slot="dropdown-menu-item"
    role="menuitem"
    tabindex="-1"
    v-bind="$attrs"
    v-on="$listeners"
    @click="onClick"
    @keydown.enter.prevent="onSelectKey"
    @keydown.space.prevent="onSelectKey"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import { dropdownMenuContext } from './context';
import { itemClasses } from './item-classes';

/*
 * DropdownMenuItem — API publique de shadcn-vue (ADR-0012).
 *
 * Remplace `<b-dropdown-item>`. Trois différences avec lui, toutes voulues :
 *
 * - **un élément désactivé n'est pas cliquable.** `b-dropdown-item` posait une
 *   classe `disabled` et laissait passer le clic sur le `<a>` ; ici le clic est
 *   arrêté et `aria-disabled` est annoncé. La classe `disabled` disparaît, et
 *   avec elle le seul sélecteur Cypress qui s'y appuyait (G-024) ;
 * - **le menu se ferme à la sélection**, y compris quand l'élément est un
 *   `router-link` : `b-dropdown-item` le faisait aussi, mais par son propre
 *   gestionnaire interne ;
 * - **`Entrée` et `Espace` activent l'élément.** Sur un `<a>` ou un
 *   `router-link`, `Espace` ne déclenchait rien.
 *
 * Le rendu par défaut est un `<button type="button">` : un élément de menu qui
 * ne navigue pas n'est pas un lien. Pour naviguer, `as="router-link"` avec
 * `:to`, comme partout ailleurs (ADR-0009).
 */
export default defineComponent({
  name: 'DropdownMenuItem',
  mixins: [classMerge, dropdownMenuContext],
  inheritAttrs: false,
  props: {
    as: {
      default: 'button',
      type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    // Décale l'élément pour l'aligner sur ceux qui portent une coche.
    inset: {
      default: false,
      type: Boolean,
    },
    variant: {
      default: 'default',
      type: String as PropType<'default' | 'destructive'>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        itemClasses({ disabled: this.disabled, inset: this.inset, variant: this.variant }),
      );
    },
  },
  methods: {
    onClick(event: MouseEvent): void {
      if (this.disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.$emit('select', event);
      this.menu.close();
    },
    onSelectKey(): void {
      if (this.disabled) {
        return;
      }
      (this.$el as HTMLElement).click();
    },
  },
});
</script>
