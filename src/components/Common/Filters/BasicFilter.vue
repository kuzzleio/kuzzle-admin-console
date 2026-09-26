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
                  class="min-w-40 flex-1"
                  :model-value="filters.basic[groupIndex][filterIndex].attribute || ''"
                  @update:modelValue="
                    (attribute) => selectAttribute(attribute, groupIndex, filterIndex)
                  "
                >
                  <SelectTrigger
                    aria-label="Attribute"
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

                <Select v-model="andBlock.operator" class="min-w-40 flex-1">
                  <SelectTrigger aria-label="Operator" data-cy="BasicFilter-operator">
                    <!-- Libellé dans le slot, comme pour le tri : la clé
                         (`not_equal`) n'est pas le libellé (E-06). -->
                    <SelectValue>{{
                      availableOperands[andBlock.operator] || andBlock.operator
                    }}</SelectValue>
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
                    <Input
                      v-model="andBlock.value"
                      class="BasicFilter--value"
                      :data-cy="`BasicFilter-valueInput--${groupIndex}.${filterIndex}`"
                      placeholder="Value"
                      type="text"
                    />
                  </template>
                  <template v-else>
                    <Input
                      v-model="andBlock.gt_value"
                      class="BasicFilter--gtValue"
                      data-cy="BasicFilter-operator-Range-Value1"
                      placeholder="Value 1"
                      type="text"
                    />
                    <Input
                      v-model="andBlock.lt_value"
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
              class="rounded-none border-0"
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
          <SelectTrigger aria-label="Sort order" data-cy="BasicFilter-sortOrderSelect">
            <!--
              Le libellé est passé dans le slot : `SelectValue` ne les connaît
              qu'une fois la liste ouverte, et ici la valeur (`asc`) et le
              libellé (`Ascending`) diffèrent.
            -->
            <SelectValue>{{ sortOrderLabel }}</SelectValue>
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

<script>
import { mapState } from 'pinia';

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
import { useKuzzleStore } from '@/stores';

const emptyBasicFilter = { attribute: null, operator: 'contains', value: null };
const emptySorting = { attribute: null, order: 'asc' };

export default {
  name: 'BasicFilter',
  components: {
    Button,
    Card,
    CardContent,
    CardFooter,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  },
  props: {
    basicFilter: Array,
    sorting: Object,
    availableOperands: {
      type: Object,
      required: true,
    },
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
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    mappingAttributes: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      filters: {
        active: 'basic',
        basic: null,
        sorting: { ...emptySorting },
      },
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
    selectAttributesValues() {
      return [
        { text: '_id', value: '_id' },
        ...Object.keys(this.mappingAttributes).map((a) => ({
          text: a,
          value: a,
        })),
      ];
    },
    sortAttributesValues() {
      return Object.keys(this.mappingAttributes)
        .filter((a) => this.mappingAttributes[a].type !== 'text')
        .map((a) => ({
          text: a,
          value: a,
        }));
    },
    sortOrderLabel() {
      return this.filters.sorting.order === 'desc' ? 'Descending' : 'Ascending';
    },
    availableOperandsFormatted() {
      return Object.keys(this.availableOperands).map((e) => ({
        value: e,
        text: this.availableOperands[e],
      }));
    },
    isFilterValid: function () {
      // For each andBlocks in orBlocks, check if attribute and value field are filled
      for (const orBlock of this.filters.basic) {
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
    },
  },
  watch: {
    basicFilter: {
      immediate: true,
      handler(value) {
        if (value) {
          this.filters.basic = value;
        } else {
          this.filters.basic = [[{ ...emptyBasicFilter }]];
        }
      },
    },
    sorting: {
      immediate: true,
      handler(value) {
        if (value) {
          this.filters.sorting = value;
        } else {
          this.filters.sorting = { ...emptySorting };
        }
      },
    },
  },
  methods: {
    isInvalidBlock(orBlock) {
      return this.isInvalidStatement(orBlock.length - 1, orBlock);
    },
    isInvalidStatement(filterIndex, orBlock) {
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
    },
    setSortAttr(attribute) {
      this.filters.sorting.attribute = attribute;
    },
    selectAttribute(attribute, groupIndex, filterIndex) {
      this.filters.basic[groupIndex][filterIndex].attribute = attribute;
    },
    generateRawFilter() {
      const raw = this.wrapper.basicSearchToESQuery(this.filters.basic, this.mappingAttributes);
      this.$log.debug(JSON.stringify(raw, null, 2));
      this.$emit('generate-raw-filter', raw);
    },
    submitSearch() {
      if (!this.isFilterValid) {
        return;
      }

      let filters = this.filters.basic;

      if (
        this.filters.basic.length === 1 &&
        this.filters.basic[0].length === 1 &&
        !this.filters.basic[0][0].attribute
      ) {
        filters = null;
      }

      if (this.sortingEnabled) {
        let sorting = this.filters.sorting;

        if (!this.filters.sorting.attribute) {
          sorting = null;
        }

        this.$emit('filter-submitted', filters, sorting);
      } else {
        this.$emit('filter-submitted', filters);
      }
    },
    resetSearch() {
      this.filters.basic = [[{ ...emptyBasicFilter }]];
      this.filters.sorting = { ...emptySorting };
      this.submitSearch();
    },
    addOrCondition() {
      this.filters.basic.push([{ ...emptyBasicFilter }]);
    },
    addAndCondition(groupIndex) {
      if (!this.filters.basic[groupIndex]) {
        return false;
      }

      this.filters.basic[groupIndex].push({ ...emptyBasicFilter });
    },
    removeAndCondition(groupIndex, filterIndex) {
      if (!this.filters.basic[groupIndex] || !this.filters.basic[groupIndex][filterIndex]) {
        return false;
      }

      if (this.filters.basic.length === 1 && this.filters.basic[0].length === 1) {
        this.filters.basic[0][0] = { ...emptyBasicFilter };
        return;
      }

      if (this.filters.basic[groupIndex].length === 1 && this.filters.basic.length > 1) {
        this.filters.basic.splice(groupIndex, 1);
        return;
      }

      this.filters.basic[groupIndex].splice(filterIndex, 1);
    },
  },
};
</script>
