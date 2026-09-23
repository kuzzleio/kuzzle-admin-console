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
        <i :class="isFavorite() === true ? 'fa fa-star' : 'far fa-star'" aria-hidden="true" />
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
    <div class="grid transition-all" :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
      <div class="overflow-hidden">
        <pre class="ml-3 whitespace-pre-wrap">{{ getFilter() }}</pre>
      </div>
    </div>

    <Dialog :open="editOpen" @update:open="onDialogToggle">
      <DialogContent labelled-by="filter-name-title">
        <DialogHeader>
          <DialogTitle id="filter-name-title">Edit favorite filter name</DialogTitle>
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
  name: 'FilterHistoryItem',
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
    filter: Object,
    favorite: Array,
    id: Number,
  },
  emits: ['change', 'filters-delete', 'submit', 'toggle-favorite'],
  data() {
    return {
      editOpen: false,
      expanded: false,
      oldName: this.filter.name,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
  },
  methods: {
    isFavorite() {
      const idIndex = this.favorite
        .map((f) => {
          return f.id;
        })
        .indexOf(this.filter.id);
      if (idIndex !== -1) {
        return true;
      } else {
        return false;
      }
    },
    cancelChange() {
      this.filter.name = this.oldName;
    },
    toggleFavorite() {
      this.$emit('toggle-favorite', !this.isFavorite());
    },
    submitChange() {
      this.$emit('change');
    },
    openModal() {
      this.editOpen = true;
    },
    /*
     * `b-modal` appelait `@cancel` et `@close` mais pas sur un clic extérieur
     * ni sur `Échap` ; `Dialog` n'a qu'un `update:open`. Toute fermeture qui
     * n'est pas « OK » restaure le nom : c'est ce que l'écran promet.
     */
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
    confirmChange() {
      this.editOpen = false;
      this.submitChange();
    },
    deleteFilter() {
      this.$emit('filters-delete', this.filter.id);
    },
    useFilter() {
      this.$parent.$emit('submit', this.filter);
    },
    getFilter() {
      const loadedFilter = Object.assign(new filterManager.Filter(), this.filter);
      if (loadedFilter.active === 'basic') return loadedFilter.basic;
      if (loadedFilter.active === 'raw') return loadedFilter.raw;
    },
    toggleCollapse() {
      this.expanded = !this.expanded;
    },
  },
};
</script>
