<template>
  <li class="tw:border-b tw:border-border tw:p-1 tw:last:border-b-0">
    <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-1">
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

      <a class="code tw:cursor-pointer" @click="toggleCollapse">{{ favorite.name }}</a>

      <Button size="icon" title="Edit Filter" variant="ghost" @click="openModal">
        <i class="fa fa-pencil-alt" aria-hidden="true" />
      </Button>

      <span class="tw:ml-auto tw:flex tw:items-center">
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
      class="tw:grid tw:transition-all"
      :class="expanded ? 'tw:grid-rows-[1fr]' : 'tw:grid-rows-[0fr]'"
    >
      <div class="tw:overflow-hidden">
        <pre class="tw:ml-3 tw:whitespace-pre-wrap">{{ getFilter() }}</pre>
      </div>
    </div>

    <Dialog :open="editOpen" @update:open="onDialogToggle">
      <DialogContent labelled-by="favorite-name-title">
        <DialogHeader>
          <DialogTitle id="favorite-name-title"
            >you want to change this favorite name ?</DialogTitle
          >
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

<script>
import { mapState } from 'pinia';

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
import { useKuzzleStore } from '@/stores';

export default {
  name: 'FavoriteFilterItem',
  components: {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
  },
  props: {
    index: String,
    collection: String,
    favorite: Object,
    id: Number,
  },
  data() {
    return {
      editOpen: false,
      expanded: false,
      oldName: this.favorite.name,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
  },
  methods: {
    cancelChange() {
      this.favorite.name = this.oldName;
    },
    openModal() {
      this.editOpen = true;
    },
    onDialogToggle(open) {
      if (!open) {
        this.cancelChange();
      }
      this.editOpen = open;
    },
    cancelAndClose() {
      this.cancelChange();
      this.editOpen = false;
    },
    deleteFavorite() {
      this.$emit('favoris-delete', this.favorite.id);
    },
    useFilter() {
      if (this.favorite.active === 'raw') {
        this.$parent.$emit('filter-raw-submitted', this.favorite.raw, true);
      }
      if (this.favorite.active === 'basic') {
        this.$parent.$emit(
          'filter-basic-submitted',
          this.favorite.basic,
          this.favorite.sorting,
          true,
        );
      }
    },
    getFilter() {
      const loadedFilter = Object.assign(new filterManager.Filter(), this.favorite);
      if (loadedFilter.active === 'basic') return loadedFilter.basic;
      if (loadedFilter.active === 'raw') return loadedFilter.raw;
    },
    toggleCollapse() {
      this.expanded = !this.expanded;
    },
  },
};
</script>
