<template>
  <div class="QuickFilter">
    <div v-if="!complexFilterActive" class="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
      <div
        class="QuickFilter-searchBar tw:flex tw:min-w-0 tw:flex-1 tw:items-stretch tw:overflow-hidden tw:rounded-md tw:border tw:border-input"
      >
        <span
          class="tw:flex tw:items-center tw:bg-muted tw:px-3 tw:text-muted-foreground"
          aria-hidden="true"
        >
          <i class="fa fa-search" />
        </span>
        <Input
          v-focus
          class="tw:rounded-none tw:border-0"
          data-cy="QuickFilter-input"
          :model-value="value"
          :placeholder="placeholder"
          type="search"
          @update:modelValue="onInput"
          @keyup.enter="submitNow"
        />
      </div>

      <Button
        v-if="!advancedFiltersVisible"
        class="QuickFilter-optionBtn"
        data-cy="QuickFilter-optionBtn"
        variant="link"
        @click.prevent="displayAdvancedFilters"
        >{{ advancedQueryLabel }}</Button
      >
      <Button
        v-else
        class="QuickFilter-optionBtn"
        variant="link"
        @click.prevent="displayAdvancedFilters"
        >Less query options</Button
      >

      <template v-if="actionButtonsVisible">
        <!--
          Ce bouton appelait `submitSearch`, une méthode qui n'existe nulle
          part : depuis toujours, il ne faisait rien. Personne ne s'en est
          aperçu parce que `submitOnType` vaut `true` par défaut et que la
          saisie déclenche déjà la recherche. Il appelle maintenant la même
          chose que la touche Entrée.
        -->
        <Button type="submit" @click.prevent="submitNow">{{ submitButtonLabel }}</Button>
        <Button data-cy="QuickFilter-resetBtn" variant="outline" @click="resetSearch">
          Reset
        </Button>
      </template>
    </div>

    <div
      v-else
      class="QuickFilter-warning tw:mb-3 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-2 tw:px-4"
    >
      <div class="QuickFilter-warning-message tw:flex tw:items-center tw:gap-2">
        <Button
          data-cy="QuickFilter-displayActiveFilters"
          variant="outline"
          @click.prevent="displayAdvancedFilters"
        >
          <i class="fa fa-filter" aria-hidden="true" />{{
            advancedFiltersVisible ? 'Hide filters' : 'Show filters'
          }}
        </Button>
        <Badge v-if="!advancedFiltersVisible" variant="secondary">Filters are being applied</Badge>
      </div>

      <Button data-cy="QuickFilter-resetBtn" variant="outline" @click="resetSearch">Reset</Button>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Focus from '@/directives/focus.directive';

/*
 * `b-form-input` avait une prop `debounce="600"` : la saisie n'était propagée
 * qu'après 600 ms de silence. La primitive `Input` n'en a pas — un champ ne
 * décide pas du rythme auquel son hôte veut être prévenu — donc l'attente vit
 * ici, où l'on sait qu'elle sert à ne pas lancer une recherche par frappe.
 */
const SEARCH_DEBOUNCE_MS = 600;

export default {
  name: 'QuickFilter',
  components: {
    Badge,
    Button,
    Input,
  },
  directives: {
    Focus,
  },
  props: {
    advancedFiltersVisible: Boolean,
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...',
    },
    complexFilterActive: Boolean,
    enabled: Boolean,
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'Search',
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true,
    },
    placeholder: {
      type: String,
      default: 'Search everywhere...',
    },
    submitOnType: {
      type: Boolean,
      default: true,
    },
    value: {
      type: String,
    },
  },
  created() {
    this.emitTerm = debounce((term) => {
      this.$emit(this.submitOnType ? 'submit' : 'input', term);
    }, SEARCH_DEBOUNCE_MS);
  },
  beforeDestroy() {
    this.emitTerm.cancel();
  },
  methods: {
    submit() {
      this.$emit('submit', this.value);
    },
    /* `Entrée` ne se fait pas attendre : la frappe en cours part tout de suite. */
    submitNow() {
      this.emitTerm.flush();
      this.submit();
    },
    resetSearch() {
      this.$emit('reset');
    },
    displayAdvancedFilters() {
      this.$emit('display-advanced-filters');
    },
    onInput(term) {
      this.emitTerm(term);
    },
  },
};
</script>
