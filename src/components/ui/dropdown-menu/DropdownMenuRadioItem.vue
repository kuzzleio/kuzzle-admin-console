<template>
  <component
    :is="as"
    :aria-checked="String(checked)"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="classes"
    data-slot="dropdown-menu-radio-item"
    role="menuitemradio"
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

interface RadioGroupContext {
  modelValue?: string;
  select: (value: string) => void;
}

/*
 * DropdownMenuRadioItem — API publique de shadcn-vue (ADR-0012).
 *
 * Remplace `<b-dropdown-item :active="…">` quand l'élément fait partie d'un
 * choix exclusif. Ce qui n'était qu'une classe devient `role="menuitemradio"`
 * et `aria-checked` : l'élément courant est annoncé.
 *
 * La coche est décorative (`aria-hidden`) — `aria-checked` dit déjà l'état, et
 * l'annoncer deux fois serait du bruit.
 */
export default defineComponent({
  name: 'DropdownMenuRadioItem',
  mixins: [classMerge, dropdownMenuContext],
  inheritAttrs: false,
  inject: {
    dropdownMenuRadioGroup: { default: null },
  },
  props: {
    as: {
      default: 'button',
      type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    value: {
      required: true,
      type: String,
    },
  },
  emits: ['select'],
  computed: {
    group(): RadioGroupContext | null {
      return (this as unknown as { dropdownMenuRadioGroup: RadioGroupContext | null })
        .dropdownMenuRadioGroup;
    },
    checked(): boolean {
      return this.group?.modelValue === this.value;
    },
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
      this.group?.select?.(this.value);
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
