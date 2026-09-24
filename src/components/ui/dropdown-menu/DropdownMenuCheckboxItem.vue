<template>
  <component
    :is="as"
    :aria-checked="String(checked)"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="classes"
    data-slot="dropdown-menu-checkbox-item"
    role="menuitemcheckbox"
    tabindex="-1"
    v-bind="$attrs"
    @click="onClick"
    @keydown.enter.prevent="onSelectKey"
    @keydown.space.prevent="onSelectKey"
  >
    <span aria-hidden="true" class="absolute left-2 flex w-4 justify-center">
      <i v-if="checked" class="fa fa-check" />
    </span>
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import { dropdownMenuContext } from './context';
import { itemClasses } from './item-classes';

/*
 * DropdownMenuCheckboxItem — API publique de shadcn-vue (ADR-0012).
 *
 * Remplace un `<b-dropdown-item>` qui portait lui-même une icône de case à
 * cocher. Le seul de la console est « Auto-Sync » sur la liste de documents :
 * l'icône disait l'état, rien ne l'annonçait. Ici c'est `role="menuitemcheckbox"`
 * et `aria-checked`, et la coche est celle de la famille — la même que
 * `DropdownMenuRadioItem`, au même emplacement.
 *
 * Le menu **ne se ferme pas** à la sélection, contrairement à `DropdownMenuItem` :
 * cocher n'est pas choisir, et fermer le menu retirerait de l'écran le retour
 * visuel qu'on vient de déclencher. C'est le comportement de l'amont.
 *
 * `v-model` passe par l'option `model` de Vue 2 (G-012).
 */
export default defineComponent({
  name: 'DropdownMenuCheckboxItem',
  mixins: [classMerge, dropdownMenuContext],
  inheritAttrs: false,
  props: {
    as: {
      default: 'button',
      type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
    checked: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
  },
  emits: ['select', 'update:checked'],
  computed: {
    classes(): string {
      return this.mergeClasses(itemClasses({ disabled: this.disabled, inset: true }));
    },
  },
  methods: {
    onClick(event: MouseEvent): void {
      if (this.disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.$emit('update:checked', !this.checked);
      this.$emit('select', event);
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
