<template>
  <PaginationRoot
    v-slot="slotProps"
    aria-label="Pagination"
    :class="cn('mx-auto flex w-full justify-center', props.class)"
    data-slot="pagination"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </PaginationRoot>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  PaginationRoot,
  type PaginationRootEmits,
  type PaginationRootProps,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * Pagination de shadcn-vue (ADR-0013, ADR-0054) : `reka-ui` calcule les
 * emplacements de la barre, `v-model:page` s'écrit comme en amont.
 *
 * Avec `show-edges`, le nombre d'emplacements reste constant tant que la barre
 * est tronquée (`2 × siblingCount + 5`) : la barre ne change pas de largeur à
 * chaque clic, comme le garantissait le calcul précédent.
 *
 * `aria-label` vaut « Pagination » par défaut ; un attribut du site d'appel
 * le remplace, pour deux barres qui cohabitent sur un même écran.
 */
const props = defineProps<PaginationRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<PaginationRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
