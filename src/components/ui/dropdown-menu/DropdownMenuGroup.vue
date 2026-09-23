<template>
  <div :aria-labelledby="labelId" :class="classes" role="group" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * DropdownMenuGroup — API publique de shadcn-vue (ADR-0012).
 *
 * Remplace `<b-dropdown-group header="…">`, qui prenait son intitulé en prop.
 * Chez l'amont l'intitulé est un `DropdownMenuLabel` placé dans le groupe : le
 * groupe fabrique l'identifiant, le libellé le porte. Aucune des deux
 * primitives n'expose d'`id` — un site d'appel ne doit pas avoir à inventer un
 * identifiant unique pour que le groupe soit annoncé.
 */
let sequence = 0;

export default defineComponent({
  name: 'DropdownMenuGroup',
  mixins: [classMerge],
  inheritAttrs: false,
  provide(): { dropdownMenuGroup: { labelId: string } } {
    return { dropdownMenuGroup: { labelId: this.labelId } };
  },
  data() {
    sequence += 1;
    return {
      labelId: `dropdown-menu-group-${sequence}`,
    };
  },
  computed: {
    classes(): string {
      return this.mergeClasses('');
    },
  },
});
</script>
