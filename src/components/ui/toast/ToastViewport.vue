<template>
  <div
    :class="classes"
    data-slot="toast-viewport"
    role="region"
    :aria-label="label"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';

/*
 * ToastViewport — API publique de shadcn-vue (ADR-0020).
 *
 * Remplace les « toasters » nommés de `bootstrap-vue`
 * (`b-toaster-bottom-right`, `b-toaster-top-center`), qui créaient un conteneur
 * par nom au premier usage. Ici la zone est posée explicitement, une fois, par
 * le site d'appel.
 *
 * `z-index` à 1045 : au-dessus de `Dialog` (1030) et des panneaux flottants
 * (1035, ADR-0018), parce qu'un toast doit rester lisible pendant qu'une
 * modale est ouverte — c'est souvent une modale qui le déclenche.
 */
export default defineComponent({
  name: 'ToastViewport',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    label: {
      default: 'Notifications',
      type: String,
    },
    position: {
      default: 'bottom-right',
      type: String as PropType<'bottom-right' | 'top-center'>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'pointer-events-none fixed z-1045 flex max-h-screen w-full max-w-sm flex-col gap-2 p-4',
        this.position === 'top-center' ? 'left-1/2 top-0 -translate-x-1/2' : 'bottom-0 right-0',
      );
    },
  },
});
</script>
