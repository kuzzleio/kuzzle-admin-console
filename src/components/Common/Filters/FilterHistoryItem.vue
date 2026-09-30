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

      <a class="code cursor-pointer" @click="toggleCollapse">{{ filter.name }}</a>

      <Button size="icon" title="Edit Filter" variant="ghost" @click="openModal">
        <i class="fa fa-pencil-alt" aria-hidden="true" />
      </Button>
      <Button
        :data-cy="'FilterHistoryItem-Add-Favorite--' + id"
        size="icon"
        title="Favorite Filters"
        variant="ghost"
        @click="toggleFavorite"
      >
        <i :class="isFavorite ? 'fa fa-star' : 'far fa-star'" aria-hidden="true" />
      </Button>

      <span class="ml-auto flex items-center">
        <Button
          :data-cy="'FilterHistoryItem-useBtn--' + id"
          size="icon"
          title="Use Filter"
          variant="ghost"
          @click="useFilter"
        >
          <i class="fa fa-search" aria-hidden="true" />
        </Button>
        <Button
          :data-cy="`FilterHistoryItem-deleteBtn--${id}`"
          size="icon"
          title="Delete Filter"
          variant="ghost"
          @click="deleteFilter"
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
          <DialogTitle>Edit favorite filter name</DialogTitle>
        </DialogHeader>
        <Input v-model="filter.name" required type="text" />
        <DialogFooter>
          <Button variant="outline" @click="cancelAndClose">Cancel</Button>
          <Button @click="confirmChange">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

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
import type { SavedFilter } from './types';

const props = defineProps<{
  collection?: string;
  favorite: SavedFilter[];
  filter: SavedFilter;
  id: number;
  index?: string;
}>();

const emit = defineEmits<{
  (e: 'change'): void;
  (e: 'filters-delete', id: number): void;
  (e: 'submit', filter: SavedFilter): void;
  (e: 'toggle-favorite', isFavorite: boolean): void;
}>();

const editOpen = ref(false);
const expanded = ref(false);
const oldName = props.filter.name;

const isFavorite = computed((): boolean => props.favorite.some((f) => f.id === props.filter.id));

function cancelChange(): void {
  props.filter.name = oldName;
}

function toggleFavorite(): void {
  emit('toggle-favorite', !isFavorite.value);
}

function submitChange(): void {
  emit('change');
}

function openModal(): void {
  editOpen.value = true;
}

/*
 * `b-modal` appelait `@cancel` et `@close` mais pas sur un clic extérieur
 * ni sur `Échap` ; `Dialog` n'a qu'un `update:open`. Toute fermeture qui
 * n'est pas « OK » restaure le nom : c'est ce que l'écran promet.
 */
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

function confirmChange(): void {
  editOpen.value = false;
  submitChange();
}

function deleteFilter(): void {
  emit('filters-delete', props.filter.id);
}

function useFilter(): void {
  emit('submit', props.filter);
}

function getFilter(): SavedFilter['basic'] | SavedFilter['raw'] | undefined {
  const loadedFilter: SavedFilter = Object.assign(new filterManager.Filter(), props.filter);
  if (loadedFilter.active === 'basic') return loadedFilter.basic;
  if (loadedFilter.active === 'raw') return loadedFilter.raw;
  return undefined;
}

function toggleCollapse(): void {
  expanded.value = !expanded.value;
}
</script>
