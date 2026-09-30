<template>
  <li class="border-b border-border p-1 last:border-b-0">
    <div class="flex flex-wrap items-center gap-1">
      <!--
        Le chevron était un `<i>` cliquable, ni atteignable au clavier ni
        annoncé : c'est un bouton, et il porte `aria-expanded`.
      -->
      <Button
        :aria-expanded="String(expanded)"
        aria-label="Toggle the filter details"
        size="icon"
        variant="ghost"
        @click="toggleCollapse"
      >
        <i :class="`fa fa-caret-${expanded ? 'down' : 'right'}`" aria-hidden="true" />
      </Button>

      <a class="code cursor-pointer" @click="toggleCollapse">{{ favorite.name }}</a>

      <Button size="icon" title="Edit Filter" variant="ghost" @click="openModal">
        <i class="fa fa-pencil-alt" aria-hidden="true" />
      </Button>

      <span class="ml-auto flex items-center">
        <Button size="icon" title="Use Filter" variant="ghost" @click="useFilter">
          <i class="fa fa-search" aria-hidden="true" />
        </Button>
        <Button
          :data-cy="'FilterFavoriItem-Remove--' + id"
          size="icon"
          title="Delete Favorite"
          variant="ghost"
          @click="deleteFavorite"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </span>
    </div>

    <!--
      `b-collapse` animait une hauteur ; la grille passe de `0fr` à `1fr`,
      c'est-à-dire la hauteur réelle du contenu, sans nombre magique — même
      traitement que l'arborescence de Data.
    -->
    <div
      class="grid transition-all motion-reduce:transition-none"
      :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <pre class="ml-3 whitespace-pre-wrap">{{ getFilter() }}</pre>
      </div>
    </div>

    <Dialog :open="editOpen" @update:open="onDialogToggle">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>you want to change this favorite name ?</DialogTitle>
        </DialogHeader>
        <Input v-model="favorite.name" required type="text" />
        <DialogFooter>
          <Button variant="outline" @click="cancelAndClose">Cancel</Button>
          <Button @click="editOpen = false">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import * as filterManager from '@/services/filterManager';
import type { BasicFilterGroups, FilterSorting, SavedFilter } from './types';

const props = defineProps<{
  collection?: string;
  favorite: SavedFilter;
  id: number;
  index?: string;
}>();

const emit = defineEmits<{
  (e: 'favoris-delete', id: number): void;
  (
    e: 'filter-basic-submitted',
    filter: BasicFilterGroups | null | undefined,
    sorting: FilterSorting | null | undefined,
  ): void;
  (e: 'filter-raw-submitted', filter: Record<string, unknown> | null | undefined): void;
}>();

const editOpen = ref(false);
const expanded = ref(false);
const oldName = props.favorite.name;

function cancelChange(): void {
  props.favorite.name = oldName;
}

function openModal(): void {
  editOpen.value = true;
}

function onDialogToggle(open: boolean): void {
  if (!open) {
    cancelChange();
  }
  editOpen.value = open;
}

function cancelAndClose(): void {
  cancelChange();
  editOpen.value = false;
}

function deleteFavorite(): void {
  emit('favoris-delete', props.favorite.id);
}

function useFilter(): void {
  if (props.favorite.active === 'raw') {
    emit('filter-raw-submitted', props.favorite.raw);
  }
  if (props.favorite.active === 'basic') {
    emit('filter-basic-submitted', props.favorite.basic, props.favorite.sorting);
  }
}

function getFilter(): SavedFilter['basic'] | SavedFilter['raw'] | undefined {
  const loadedFilter: SavedFilter = Object.assign(new filterManager.Filter(), props.favorite);
  if (loadedFilter.active === 'basic') return loadedFilter.basic;
  if (loadedFilter.active === 'raw') return loadedFilter.raw;
  return undefined;
}

function toggleCollapse(): void {
  expanded.value = !expanded.value;
}
</script>
