<template>
  <form class="BasicFilter" @submit.prevent="submitSearch">
    <div class="BasicFilter-predicates" data-cy="BasicFilter-predicates">
      <div class="BasicFilter-predicate">
        <div
          v-for="(orBlock, groupIndex) in filters.basic"
          :key="`orBlock-${groupIndex}`"
          class="BasicFilter-orBlock"
        >
          <Card class="bg-muted">
            <CardContent class="flex flex-col gap-2">
              <div
                v-for="(andBlock, filterIndex) in orBlock"
                :key="`andBlock-${filterIndex}`"
                class="flex flex-wrap items-center gap-2"
              >
                <span
                  class="w-10 shrink-0 text-center font-bold text-muted-foreground"
                  :class="filterIndex === 0 ? 'invisible' : ''"
                  >AND</span
                >

                <!--
                  `v-b-popover.hover.top` posait une bulle bootstrap-vue sur
                  une icône ; l'attribut `title` dit la même chose, et le
                  navigateur l'affiche sans directive.
                -->
                <i
                  v-if="filterIndex === 0"
                  class="fas fa-question-circle fa-lg shrink-0 text-muted-foreground"
                  title="For an attribute to be in the list, it must be contained in the mapping."
                />
                <span v-else class="w-5 shrink-0" />

                <Select
                  :model-value="filters.basic[groupIndex][filterIndex].attribute || ''"
                  @update:modelValue="
                    (attribute) => selectAttribute(attribute, groupIndex, filterIndex)
                  "
                >
                  <SelectTrigger
                    aria-label="Attribute"
                    class="min-w-40 flex-1"
                    :data-cy="`BasicFilter-attributeSelect--${groupIndex}.${filterIndex}`"
                  >
                    <SelectValue placeholder="Attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="attribute of selectAttributesValues"
                      :key="attribute.value"
                      :value="attribute.value"
                      >{{ attribute.text }}</SelectItem
                    >
                  </SelectContent>
                </Select>

                <Select v-model="andBlock.operator">
                  <SelectTrigger
                    aria-label="Operator"
                    class="min-w-40 flex-1"
                    data-cy="BasicFilter-operator"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="operand of availableOperandsFormatted"
                      :key="operand.value"
                      :value="operand.value"
                      >{{ operand.text }}</SelectItem
                    >
                  </SelectContent>
                </Select>

                <div
                  v-if="andBlock.operator !== 'exists' && andBlock.operator !== 'not_exists'"
                  class="flex min-w-40 flex-1 flex-col gap-1"
                >
                  <template v-if="andBlock.operator !== 'range'">
                    <!--
                      Une condition vide vaut `null` — c'est ce que l'historique
                      et l'URL enregistrent — et `Input` n'accepte pas `null`.
                    -->
                    <Input
                      :model-value="andBlock.value ?? undefined"
                      aria-label="Value"
                      class="BasicFilter--value"
                      :data-cy="`BasicFilter-valueInput--${groupIndex}.${filterIndex}`"
                      placeholder="Value"
                      type="text"
                      @update:model-value="andBlock.value = $event"
                    />
                  </template>
                  <template v-else>
                    <Input
                      v-model="andBlock.gt_value"
                      aria-label="Range lower bound"
                      class="BasicFilter--gtValue"
                      data-cy="BasicFilter-operator-Range-Value1"
                      placeholder="Value 1"
                      type="text"
                    />
                    <Input
                      v-model="andBlock.lt_value"
                      aria-label="Range upper bound"
                      class="BasicFilter--ltValue"
                      data-cy="BasicFilter-operator-Range-Value2"
                      placeholder="Value 2"
                      type="text"
                    />
                  </template>
                </div>

                <Button
                  v-if="filterIndex > 0 || groupIndex > 0"
                  aria-label="Remove this condition"
                  size="icon"
                  variant="ghost"
                  @click="removeAndCondition(groupIndex, filterIndex)"
                >
                  <i class="fa fa-times" aria-hidden="true" />
                </Button>

                <Button
                  v-if="filterIndex === orBlock.length - 1"
                  :disabled="isInvalidStatement(filterIndex, orBlock)"
                  variant="outline"
                  @click="addAndCondition(groupIndex)"
                >
                  <i class="fa fa-plus" aria-hidden="true" />AND
                </Button>
              </div>
            </CardContent>

            <CardFooter v-if="groupIndex === filters.basic.length - 1">
              <Button :disabled="isInvalidBlock(orBlock)" variant="outline" @click="addOrCondition">
                <i class="fa fa-plus" aria-hidden="true" />OR
              </Button>
            </CardFooter>
          </Card>

          <div
            v-if="groupIndex < filters.basic.length - 1"
            class="my-2 flex items-center gap-3 text-muted-foreground"
          >
            <hr class="flex-1 border-border" />
            <b>OR</b>
            <hr class="flex-1 border-border" />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <template v-if="sortingEnabled">
        <div class="flex items-stretch overflow-hidden rounded-sm border border-input">
          <span
            id="basic-filter-sort-label"
            class="flex items-center bg-muted px-3 font-sans text-sm text-muted-foreground"
            >Sort</span
          >
          <Select
            :model-value="filters.sorting.attribute || ''"
            @update:modelValue="(attribute) => setSortAttr(attribute)"
          >
            <SelectTrigger
              aria-labelledby="basic-filter-sort-label"
              class="w-auto rounded-none border-0"
              data-cy="BasicFilter-sortAttributeSelect"
            >
              <SelectValue placeholder="Attribute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="attribute of sortAttributesValues"
                :key="attribute.value"
                :value="attribute.value"
                >{{ attribute.text }}</SelectItem
              >
            </SelectContent>
          </Select>
        </div>

        <Select v-model="filters.sorting.order">
          <SelectTrigger
            aria-label="Sort order"
            class="w-auto"
            data-cy="BasicFilter-sortOrderSelect"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </template>

      <div v-if="actionButtonsVisible" class="ml-auto flex flex-wrap gap-2">
        <Button
          class="BasicFilter-generateRawBtn"
          data-cy="BasicFilter-generateRawBtn"
          variant="outline"
          @click.prevent="generateRawFilter"
        >
          <i class="fas fa-scroll" aria-hidden="true" />&nbsp;Generate Raw JSON
        </Button>
        <Button
          class="BasicFilter-resetBtn"
          data-cy="BasicFilter-resetBtn"
          variant="outline"
          @click="resetSearch"
        >
          Reset
        </Button>
        <Button
          class="BasicFilter-submitBtn"
          data-cy="BasicFilter-submitBtn"
          @click.prevent="submitSearch"
        >
          {{ submitButtonLabel }}
        </Button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/lib/logger';
import type { MappingAttributes } from '@/services/mappingHelpers';
import { useKuzzleStore } from '@/stores';
import type { BasicFilterGroups, BasicFilterStatement, FilterSorting } from './types';

const emptyBasicFilter: BasicFilterStatement = {
  attribute: null,
  operator: 'contains',
  value: null,
};
const emptySorting: FilterSorting = { attribute: null, order: 'asc' };

const props = withDefaults(
  defineProps<{
    actionButtonsVisible?: boolean;
    availableOperands: Record<string, string>;
    basicFilter?: BasicFilterGroups | null;
    mappingAttributes: MappingAttributes;
    sorting?: FilterSorting | null;
    sortingEnabled?: boolean;
    submitButtonLabel?: string;
  }>(),
  {
    actionButtonsVisible: true,
    basicFilter: undefined,
    sorting: undefined,
    sortingEnabled: true,
    submitButtonLabel: 'Search',
  },
);

const emit = defineEmits<{
  (e: 'filter-submitted', filter: BasicFilterGroups | null, sorting?: FilterSorting | null): void;
  (e: 'generate-raw-filter', raw: object): void;
}>();

const kuzzleStore = useKuzzleStore();

// Les deux `watch` immédiats ci-dessous remplacent ces valeurs avant le rendu.
const filters = reactive<{ basic: BasicFilterGroups; sorting: FilterSorting }>({
  basic: [[{ ...emptyBasicFilter }]],
  sorting: { ...emptySorting },
});

const selectAttributesValues = computed((): { text: string; value: string }[] => [
  { text: '_id', value: '_id' },
  ...Object.keys(props.mappingAttributes).map((a) => ({
    text: a,
    value: a,
  })),
]);

const sortAttributesValues = computed((): { text: string; value: string }[] =>
  Object.keys(props.mappingAttributes)
    .filter((a) => props.mappingAttributes[a].type !== 'text')
    .map((a) => ({
      text: a,
      value: a,
    })),
);

const availableOperandsFormatted = computed((): { text: string; value: string }[] =>
  Object.keys(props.availableOperands).map((e) => ({
    value: e,
    text: props.availableOperands[e],
  })),
);

const isFilterValid = computed((): boolean => {
  // For each andBlocks in orBlocks, check if attribute and value field are filled
  for (const orBlock of filters.basic) {
    for (const andBlock of orBlock) {
      if (
        (andBlock.operator === 'exists' || andBlock.operator === 'not_exists') &&
        andBlock.attribute
      ) {
        return true;
      }
      if (
        (!andBlock.attribute && andBlock.value) ||
        (andBlock.attribute && !andBlock.value && !andBlock.lt_value && !andBlock.gt_value)
      ) {
        return false;
      }
    }
  }

  return true;
});

watch(
  () => props.basicFilter,
  (value) => {
    if (value) {
      filters.basic = value;
    } else {
      filters.basic = [[{ ...emptyBasicFilter }]];
    }
  },
  { immediate: true },
);

watch(
  () => props.sorting,
  (value) => {
    if (value) {
      filters.sorting = value;
    } else {
      filters.sorting = { ...emptySorting };
    }
  },
  { immediate: true },
);

function isInvalidBlock(orBlock: BasicFilterStatement[]): boolean {
  return isInvalidStatement(orBlock.length - 1, orBlock);
}

// Un opérateur hors de cette liste (ceux du temps réel) n'invalide rien.
function isInvalidStatement(filterIndex: number, orBlock: BasicFilterStatement[]): boolean {
  const statement = orBlock[filterIndex];
  const operator = statement.operator;

  switch (operator) {
    case 'contains':
    case 'not_contains':
    case 'equal':
    case 'not_equal':
      return Boolean(!statement.attribute || !statement.value);
    case 'exists':
    case 'not_exists':
      return Boolean(!statement.attribute);
    case 'range':
      return Boolean(!statement.attribute || (!statement.gt_value && !statement.lt_value));
  }
  return false;
}

// Le `Select` rend une valeur de `reka-ui` (`AcceptableValue`) : ses options
// sont des noms d'attributs, rien d'autre ne peut en sortir.
function setSortAttr(attribute: unknown): void {
  if (typeof attribute === 'string') {
    filters.sorting.attribute = attribute;
  }
}

function selectAttribute(attribute: unknown, groupIndex: number, filterIndex: number): void {
  if (typeof attribute === 'string') {
    filters.basic[groupIndex][filterIndex].attribute = attribute;
  }
}

function generateRawFilter(): void {
  const wrapper = kuzzleStore.wrapper;
  if (!wrapper) {
    throw new Error('No Kuzzle wrapper set for the current environment');
  }
  const raw = wrapper.basicSearchToESQuery(filters.basic, props.mappingAttributes);
  logger.debug(JSON.stringify(raw, null, 2));
  emit('generate-raw-filter', raw);
}

function submitSearch(): void {
  if (!isFilterValid.value) {
    return;
  }

  let basic: BasicFilterGroups | null = filters.basic;

  if (
    filters.basic.length === 1 &&
    filters.basic[0].length === 1 &&
    !filters.basic[0][0].attribute
  ) {
    basic = null;
  }

  if (props.sortingEnabled) {
    let sorting: FilterSorting | null = filters.sorting;

    if (!filters.sorting.attribute) {
      sorting = null;
    }

    emit('filter-submitted', basic, sorting);
  } else {
    emit('filter-submitted', basic);
  }
}

function resetSearch(): void {
  filters.basic = [[{ ...emptyBasicFilter }]];
  filters.sorting = { ...emptySorting };
  submitSearch();
}

function addOrCondition(): void {
  filters.basic.push([{ ...emptyBasicFilter }]);
}

function addAndCondition(groupIndex: number): void {
  if (!filters.basic[groupIndex]) {
    return;
  }

  filters.basic[groupIndex].push({ ...emptyBasicFilter });
}

function removeAndCondition(groupIndex: number, filterIndex: number): void {
  if (!filters.basic[groupIndex] || !filters.basic[groupIndex][filterIndex]) {
    return;
  }

  if (filters.basic.length === 1 && filters.basic[0].length === 1) {
    filters.basic[0][0] = { ...emptyBasicFilter };
    return;
  }

  if (filters.basic[groupIndex].length === 1 && filters.basic.length > 1) {
    filters.basic.splice(groupIndex, 1);
    return;
  }

  filters.basic[groupIndex].splice(filterIndex, 1);
}
</script>
