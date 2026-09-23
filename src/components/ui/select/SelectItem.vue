<template>
  <component
    :is="as"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-selected="String(selected)"
    :class="classes"
    data-slot="select-item"
    role="option"
    tabindex="-1"
    type="button"
    v-bind="$attrs"
    @click="onClick"
    @keydown.enter.prevent="onSelectKey"
    @keydown.space.prevent="onSelectKey"
  >
    <span aria-hidden="true" class="absolute left-2 flex w-4 justify-center">
      <i v-if="selected" class="fa fa-check" />
    </span>
    <SelectItemText><slot /></SelectItemText>
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import { selectContext, type SelectOptionValue } from './context';
import { itemClasses } from './item-classes';

import SelectItemText from './SelectItemText.vue';

/*
 * SelectItem — API publique de shadcn-vue (ADR-0014).
 *
 * Remplace une `<option>` de `<b-form-select>`. Deux choses que l'`<option>`
 * native faisait gratuitement et qu'il faut poser ici :
 *
 * - **la valeur garde son type.** `value` accepte un nombre, et c'est ce nombre
 *   qui remonte : une `<option>` native n'aurait rendu que sa chaîne, et
 *   `PerPageSelector` émettait déjà un nombre via `<b-form-select>` ;
 * - **le libellé est déclaré à la racine**, parce que le panneau est démonté à
 *   la fermeture et que le déclencheur doit continuer de l'afficher.
 *
 * `updated()` autant que `mounted()` : un libellé traduit ou recalculé après le
 * montage doit corriger l'index, sinon le déclencheur garde l'ancien texte.
 */
export default defineComponent({
  name: 'SelectItem',
  components: { SelectItemText },
  mixins: [classMerge, selectContext],
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
    value: {
      required: true,
      type: [String, Number] as PropType<SelectOptionValue>,
    },
  },
  emits: ['select'],
  computed: {
    classes(): string {
      return this.mergeClasses(itemClasses({ disabled: this.disabled }));
    },
    selected(): boolean {
      return String(this.select.modelValue) === String(this.value);
    },
  },
  mounted() {
    this.registerLabel();
  },
  updated() {
    this.registerLabel();
  },
  methods: {
    registerLabel(): void {
      const label = (this.$el as HTMLElement).textContent?.trim() ?? '';
      if (label && this.select.labels[String(this.value)] !== label) {
        this.select.registerLabel(this.value, label);
      }
    },
    onClick(event: MouseEvent): void {
      if (this.disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.select.select(this.value);
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
