<template>
  <div class="QuickFilter">
    <div v-if="!complexFilterActive" class="flex flex-wrap items-center gap-2">
      <div
        class="QuickFilter-searchBar flex min-w-48 flex-1 items-stretch overflow-hidden rounded-sm border border-input"
      >
        <span class="flex items-center bg-muted px-3 text-muted-foreground" aria-hidden="true">
          <i class="fa fa-search" />
        </span>
        <Input
          v-focus
          aria-label="Quick search"
          class="rounded-none border-0"
          data-cy="QuickFilter-input"
          :model-value="value"
          :placeholder="placeholder"
          type="search"
          @update:modelValue="handleInput"
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
      class="QuickFilter-warning mb-3 flex flex-wrap items-center justify-between gap-2 px-4"
    >
      <div class="QuickFilter-warning-message flex items-center gap-2">
        <Button
          data-cy="QuickFilter-displayActiveFilters"
          variant="outline"
          @click.prevent="displayAdvancedFilters"
        >
          <i class="fa fa-filter" aria-hidden="true" />{{
            advancedFiltersVisible ? 'Hide filters' : 'Show filters'
          }}
        </Button>
        <Badge v-if="!advancedFiltersVisible" variant="info">Filters are being applied</Badge>
      </div>

      <Button data-cy="QuickFilter-resetBtn" variant="outline" @click="resetSearch">Reset</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { debounce } from 'lodash';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import vFocus from '@/directives/focus.directive';

/*
 * `b-form-input` avait une prop `debounce="600"` : la saisie n'était propagée
 * qu'après 600 ms de silence. La primitive `Input` n'en a pas — un champ ne
 * décide pas du rythme auquel son hôte veut être prévenu — donc l'attente vit
 * ici, où l'on sait qu'elle sert à ne pas lancer une recherche par frappe.
 */
const SEARCH_DEBOUNCE_MS = 600;

const props = withDefaults(
  defineProps<{
    actionButtonsVisible?: boolean;
    advancedFiltersVisible?: boolean;
    advancedQueryLabel?: string;
    complexFilterActive?: boolean;
    placeholder?: string;
    submitButtonLabel?: string;
    submitOnType?: boolean;
    value?: string;
  }>(),
  {
    actionButtonsVisible: true,
    advancedQueryLabel: 'Advanced query...',
    placeholder: 'Search everywhere...',
    submitButtonLabel: 'Search',
    submitOnType: true,
    value: undefined,
  },
);

/*
 * `input` est émis selon `submitOnType` — il doit être déclaré comme les
 * autres, sans quoi il retombe en écouteur DOM natif sur la racine et reçoit
 * les `input` du champ de recherche (G-049).
 */
const emit = defineEmits<{
  (e: 'display-advanced-filters'): void;
  (e: 'input', term: string | number): void;
  (e: 'reset'): void;
  (e: 'submit', term: string | number | undefined): void;
}>();

const emitTerm = debounce((term: string | number): void => {
  if (props.submitOnType) {
    emit('submit', term);
  } else {
    emit('input', term);
  }
}, SEARCH_DEBOUNCE_MS);

onBeforeUnmount(() => {
  emitTerm.cancel();
});

function submit(): void {
  emit('submit', props.value);
}

/* `Entrée` ne se fait pas attendre : la frappe en cours part tout de suite. */
function submitNow(): void {
  emitTerm.flush();
  submit();
}

function resetSearch(): void {
  emit('reset');
}

function displayAdvancedFilters(): void {
  emit('display-advanced-filters');
}

function handleInput(term: string | number): void {
  emitTerm(term);
}
</script>
