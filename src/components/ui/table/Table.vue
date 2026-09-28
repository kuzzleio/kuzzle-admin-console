<template>
  <div class="relative w-full overflow-x-auto" data-slot="table-container">
    <table
      :class="cn('w-full caption-bottom bg-card font-sans text-sm', props.class)"
      data-slot="table"
      v-bind="$attrs"
    >
      <slot />
    </table>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/*
 * Table de shadcn-vue (ADR-0011, ADR-0054).
 *
 * C'est du **balisage** : la primitive ne connaît ni les données, ni le tri, ni
 * le filtre. Le composant amont n'en sait pas plus — il n'existe pas de
 * `DataTable` chez shadcn-vue, et la logique de liste reste dans les pages
 * (ADR-0011).
 *
 * L'enveloppe `overflow-x-auto` est portée par la primitive : un tableau qui
 * déborde sans défilement coupe ses dernières colonnes, et ça ne se voit qu'en
 * petite fenêtre.
 *
 * Les attributs du site d'appel (`data-cy`, `aria-*`) vont sur le `<table>`,
 * pas sur l'enveloppe : c'est là que les specs et les lecteurs d'écran les
 * cherchent. L'amont les laisse tomber sur l'enveloppe.
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
