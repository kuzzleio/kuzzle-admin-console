<template>
  <Pagination
    :items-per-page="itemsPerPage"
    :page="page"
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
          :is-active="item.value === page"
          :value="item.value"
        />
        <PaginationEllipsis v-else :key="`ellipsis-${index}`" />
      </template>
      <PaginationNext />
      <PaginationLast />
    </PaginationContent>
  </Pagination>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
export default defineComponent({
  name: 'ListPagination',
  components: {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationFirst,
    PaginationItem,
    PaginationLast,
    PaginationNext,
    PaginationPrevious,
  },
  inheritAttrs: false,
  props: {
    itemsPerPage: {
      required: true,
      type: Number,
    },
    page: {
      default: 1,
      type: Number,
    },
    total: {
      required: true,
      type: Number,
    },
  },
});
</script>
