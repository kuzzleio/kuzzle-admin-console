<template>
  <label :class="classes" v-bind="$attrs" v-on="$listeners">
    <slot />
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * Label — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace le libellé de `b-form-group`. L'association au champ reste au site
 * d'appel (`for` / `id`) : c'est lui qui connaît l'identifiant, et un libellé
 * qui devinerait son champ serait plus fragile qu'utile.
 */
export default defineComponent({
  name: 'Label',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('font-sans text-sm font-medium leading-none text-foreground');
    },
  },
});
</script>
