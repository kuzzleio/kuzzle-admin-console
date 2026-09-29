<template>
  <Pagination
    :items-per-page="itemsPerPage"
    :page="currentPage"
    show-edges
    :total="total"
    v-bind="$attrs"
    @update:page="$emit('update:page', $event)"
  >
    <PaginationContent v-slot="{ items }">
      <PaginationFirst />
      <PaginationPrevious />
      <template v-for="(item, index) in items">
        <PaginationItem
          v-if="item.type === 'page'"
          :key="item.value"
          :is-active="item.value === currentPage"
          :value="item.value"
        />
        <PaginationEllipsis v-else :key="`ellipsis-${index}`" />
      </template>
      <PaginationNext />
      <PaginationLast />
    </PaginationContent>
  </Pagination>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

/*
 * La barre de pagination de la console.
 *
 * Ce n'est pas une primitive : c'est la composition que les quatre listes
 * paginées de la console partagent — Documents, Rôles, Profils, Utilisateurs.
 * Elles affichaient toutes le même `<b-pagination>` avec les trois mêmes
 * props ; leur donner quatre copies du bloc de composition amont, c'était
 * quatre occasions de diverger.
 *
 * Le découpage est celui d'ADR-0011 : la primitive reste fidèle à l'amont, et
 * ce qui est propre à la console vit à côté, dans `Common/`. En phase 4, c'est
 * ce fichier-là qui absorbe le changement d'import, pas les quatre écrans.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    itemsPerPage: number;
    page?: number;
    total: number;
  }>(),
  { page: 1 },
);

defineEmits<{
  (e: 'update:page', page: number): void;
}>();

/*
 * La page affichée, bornée au nombre de pages : quand le nombre de
 * résultats passe sous la page courante, la barre ne doit pas désigner une
 * page qui n'existe plus. La primitive précédente le faisait elle-même ;
 * `PaginationRoot` prend la page telle quelle.
 */
const currentPage = computed((): number => {
  const pageCount = Math.max(1, Math.ceil(props.total / props.itemsPerPage));
  return Math.min(Math.max(1, props.page), pageCount);
});
</script>
