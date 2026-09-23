<template>
  <div :class="classes" data-slot="tabs" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import type { TabsContext, TabsValue } from './context';

let instanceCount = 0;

/*
 * Tabs — API publique de shadcn-vue (ADR-0017).
 *
 * Remplace `<b-tabs>`. Trois différences avec lui, toutes voulues :
 *
 * - **un onglet est désigné par une valeur, pas par son rang.** `b-tabs`
 *   pilotait l'onglet courant par un index (`:active="1"`), qui change dès
 *   qu'un onglet apparaît ou disparaît sous condition ;
 * - **le panneau caché n'est pas rendu.** `b-tabs` montait tous ses panneaux
 *   et masquait les inactifs ; ici `TabsContent` ne rend que l'onglet courant,
 *   ce qui évite qu'un formulaire invisible participe à la validation ou pose
 *   des `id` en double ;
 * - **les flèches du clavier déplacent la sélection.** `b-tabs` ne gérait que
 *   le `Tab` d'un déclencheur au suivant, là où le motif ARIA veut un seul
 *   arrêt de tabulation pour la barre entière.
 *
 * La racine ne rend qu'une enveloppe : c'est `TabsList` qui porte
 * `role="tablist"`.
 */
export default defineComponent({
  name: 'Tabs',
  mixins: [classMerge],
  inheritAttrs: false,
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  provide(): { tabsRoot: TabsContext } {
    return { tabsRoot: this as unknown as TabsContext };
  },
  props: {
    defaultValue: {
      default: null,
      type: String as PropType<TabsValue | null>,
    },
    modelValue: {
      default: null,
      type: String as PropType<TabsValue | null>,
    },
    orientation: {
      default: 'horizontal',
      type: String as PropType<'horizontal' | 'vertical'>,
    },
  },
  data() {
    instanceCount += 1;

    return {
      baseId: `tabs-${instanceCount}`,
      internalValue: this.modelValue ?? this.defaultValue,
      order: [] as TabsValue[],
    };
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'flex gap-2',
        this.orientation === 'vertical' ? 'flex-row' : 'flex-col',
      );
    },
    value(): TabsValue | null {
      /* Contrôlé quand le site d'appel passe `modelValue`, libre sinon. */
      return this.modelValue ?? this.internalValue;
    },
  },
  methods: {
    register(value: TabsValue): void {
      if (!this.order.includes(value)) {
        this.order.push(value);
      }
      /* Le premier onglet monté fait l'onglet courant tant que rien ne l'a
         désigné — c'est ce que faisait `b-tabs` avec son index 0. */
      if (this.internalValue === null && this.modelValue === null) {
        this.internalValue = value;
      }
    },
    select(value: TabsValue): void {
      this.internalValue = value;
      this.$emit('update:modelValue', value);
    },
    selectRelative(from: TabsValue, offset: number | 'first' | 'last'): void {
      if (this.order.length === 0) {
        return;
      }

      if (offset === 'first') {
        this.select(this.order[0]);
        return;
      }
      if (offset === 'last') {
        this.select(this.order[this.order.length - 1]);
        return;
      }

      const current = this.order.indexOf(from);
      const next = (current + offset + this.order.length) % this.order.length;

      this.select(this.order[next]);
    },
    unregister(value: TabsValue): void {
      this.order = this.order.filter((entry) => entry !== value);
    },
  },
});
</script>
