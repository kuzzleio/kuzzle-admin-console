<template>
  <div :id="labelId" :class="classes" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * DropdownMenuLabel — intitulé de section, API publique de shadcn-vue.
 *
 * Il n'a pas de rôle ARIA : c'est du texte, et le lecteur d'écran l'annonce
 * parce que le groupe le désigne par `aria-labelledby`, pas parce qu'il est
 * dans le menu. Placé hors d'un groupe, il reste un simple intitulé visuel.
 */
export default defineComponent({
  name: 'DropdownMenuLabel',
  mixins: [classMerge],
  inheritAttrs: false,
  inject: {
    dropdownMenuGroup: { default: null },
  },
  computed: {
    classes(): string {
      return this.mergeClasses('px-2 py-1.5 font-sans text-xs font-semibold text-muted-foreground');
    },
    labelId(): string | undefined {
      return (this as unknown as { dropdownMenuGroup: { labelId: string } | null })
        .dropdownMenuGroup?.labelId;
    },
  },
});
</script>
