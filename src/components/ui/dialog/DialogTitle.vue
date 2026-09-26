<template>
  <h2 :class="classes" v-bind="$attrs">
    <slot />
  </h2>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Titre de modale. Relié au panneau par `labelledBy` : c'est ce que le
 * lecteur d'écran annonce à l'ouverture. */
export default defineComponent({
  name: 'DialogTitle',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('font-sans text-title font-bold text-card-foreground');
    },
  },
});
</script>
