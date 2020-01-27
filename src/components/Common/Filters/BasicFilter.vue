<template>
  <form class="BasicFilter" @submit.prevent="submitSearch">
    <b-container fluid class="mt-2">
      <b-row no-gutters>
        <b-col cols="12">
          <b-card>
            <template v-slot:header>
              <b-row no-gutters class="BasicFilter-query">
                <p><i class="fa fa-search" />Query</p>
              </b-row>
            </template>
            <b-card-text>
              <b-row
                no-gutters
                v-for="(orBlock, groupIndex) in filters.basic"
                :key="`orBlock-${groupIndex}`"
                class="BasicFilter-orBlock"
              >
                <b-col cols="12">
                  <b-card body-bg-variant="light">
                    <b-row>
                      <b-col cols="10">
                        <b-row
                          v-for="(andBlock, filterIndex) in orBlock"
                          :key="`andBlock-${filterIndex}`"
                          cols="12"
                        >
                          <b-col cols="1" align-self="center">
                            <b-badge
                              v-show="filterIndex !== 0"
                              pill
                              variant="info"
                            >
                              And
                            </b-badge>
                          </b-col>
                          <b-col cols="4">
                            <b-form-select
                              placeholder="Attribute"
                              @change="
                                attribute =>
                                  selectAttribute(
                                    attribute,
                                    groupIndex,
                                    filterIndex
                                  )
                              "
                              :value="
                                filters.basic[groupIndex][filterIndex]
                                  .attribute || ''
                              "
                              :options="selectAttributesValues"
                            >
                              <template v-slot:first>
                                <b-form-select-option :value="''" disabled
                                  >Attribute</b-form-select-option
                                >
                              </template>
                            </b-form-select>
                          </b-col>
                          <b-col cols="3">
                            <b-form-select
                              v-model="andBlock.operator"
                              :options="availableOperandsFormatted"
                            />
                          </b-col>
                          <b-col
                            cols="3"
                            v-if="andBlock.operator !== 'range'"
                            v-show="
                              andBlock.operator !== 'exists' &&
                                andBlock.operator !== 'not_exists'
                            "
                          >
                            <b-form-input
                              v-model="andBlock.value"
                              placeholder="Value"
                              type="text"
                              class="BasicFilter--value validate"
                            />
                          </b-col>
                          <div v-else>
                            <b-col cols="1">
                              <b-form-input
                                v-model="andBlock.gt_value"
                                placeholder="Value 1"
                                type="text"
                                class="BasicFilter--gtValue validate"
                              />
                            </b-col>
                            <b-col cols="1">
                              <b-form-input
                                v-model="andBlock.lt_value"
                                placeholder="Value 2"
                                type="text"
                                class="BasicFilter--ltValue validate"
                              />
                            </b-col>
                          </div>
                          <b-col cols="1">
                            <i
                              class="fa fa-times mt-2"
                              @click="
                                removeAndBasicFilter(groupIndex, filterIndex)
                              "
                            />
                          </b-col>
                        </b-row>
                      </b-col>
                      <b-col cols="2" align-self="center">
                        <b-row no-gutters class="justify-content-md-center">
                          <b-button
                            variant="primary"
                            @click="addAndBasicFilter(groupIndex)"
                          >
                            <i class="fa fa-plus left mr-2" />New condition
                          </b-button>
                        </b-row>
                      </b-col>
                    </b-row>
                  </b-card>
                </b-col>
                <b-col cols="12" class="mt-4">
                  <b-alert
                    class="text-center"
                    variant="info"
                    :show="groupIndex < filters.basic.length - 1"
                  >
                    Or
                  </b-alert>
                </b-col>
              </b-row>

              <b-row no-gutters class="ml-1">
                <b-button @click="addGroupBasicFilter" variant="primary">
                  <i class="fa fa-plus left mr-2" />New or block
                </b-button>
              </b-row>
            </b-card-text>
          </b-card>
          <b-row no-gutters v-if="sortingEnabled">
            <b-col cols="12">
              <b-card class="mt-4">
                <template v-slot:header>
                  <b-row no-gutters>
                    <p><i class="fa fa-sort-amount-asc" />Sorting</p>
                  </b-row>
                </template>
                <b-card-text>
                  <b-row class="block-content">
                    <b-col cols="4">
                      <b-form-select
                        placeholder="Attribute"
                        :value="filters.sorting.attribute || ''"
                        @change="attribute => setSortAttr(attribute)"
                        :options="selectAttributesValues"
                      >
                        <template v-slot:first>
                          <b-form-select-option :value="''" disabled
                            >Attribute</b-form-select-option
                          >
                        </template></b-form-select
                      >
                    </b-col>
                    <b-col cols="2" class="BasicFilter-sortingValue">
                      <b-select
                        v-model="filters.sorting.order"
                        :options="[
                          { value: 'asc', text: 'asc' },
                          { value: 'desc', text: 'desc' }
                        ]"
                      />
                    </b-col>
                  </b-row>
                </b-card-text>
              </b-card>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row no-gutters v-if="actionButtonsVisible">
        <b-button
          variant="primary"
          class="BasicFilter-submitBtn mt-2 mb-2 mr-2"
          @click.prevent="submitSearch"
        >
          {{ submitButtonLabel }}
        </b-button>
        <b-button
          variant="outline-primary"
          class="BasicFilter-resetBtn m-2"
          @click="resetSearch"
        >
          Reset
        </b-button>
      </b-row>
    </b-container>
  </form>
</template>

<script>
const emptyBasicFilter = { attribute: null, operator: 'match', value: null }
const emptySorting = { attribute: null, order: 'asc' }

export default {
  name: 'BasicFilter',
  props: {
    basicFilter: Array,
    sorting: Object,
    setBasicFilter: Function,
    availableOperands: {
      type: Object,
      required: true
    },
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'search'
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true
    },
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    collectionMapping: {
      type: Object,
      required: true
    },
    toggleAutoComplete: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      filters: {
        active: 'basic',
        basic: null,
        sorting: { ...emptySorting }
      }
    }
  },
  computed: {
    selectAttributesValues() {
      return this.attributeItems.map(a => ({ text: a, value: a }))
    },
    availableOperandsFormatted() {
      return Object.keys(this.availableOperands).map(e => ({
        value: e,
        text: this.availableOperands[e]
      }))
    },
    attributeItems() {
      return this.buildAttributeList(this.collectionMapping)
    },
    isFilterValid: function() {
      // For each andBlocks in orBlocks, check if attribute and value field are filled
      for (const orBlock of this.filters.basic) {
        for (const andBlock of orBlock) {
          if (
            (andBlock.operator === 'exists' ||
              andBlock.operator === 'not_exists') &&
            andBlock.attribute
          ) {
            return true
          }
          if (
            (!andBlock.attribute && andBlock.value) ||
            (andBlock.attribute &&
              !andBlock.value &&
              !andBlock.lt_value &&
              !andBlock.gt_value)
          ) {
            return false
          }
        }
      }

      return true
    }
  },
  watch: {
    basicFilter: {
      immediate: true,
      handler(value) {
        if (value) {
          this.filters.basic = value
        } else {
          this.filters.basic = [[{ ...emptyBasicFilter }]]
        }
      }
    },
    sorting: {
      immediate: true,
      handler(value) {
        if (value) {
          this.filters.sorting = value
        } else {
          this.filters.sorting = { ...emptySorting }
        }
      }
    }
  },
  methods: {
    setSortAttr(attribute) {
      this.$set(this.filters.sorting, 'attribute', attribute)
    },
    selectAttribute(attribute, groupIndex, filterIndex) {
      console.log(attribute, groupIndex, filterIndex)

      this.filters.basic[groupIndex][filterIndex].attribute = attribute
    },
    submitSearch() {
      if (!this.isFilterValid) {
        return
      }

      let filters = this.filters.basic

      if (
        this.filters.basic.length === 1 &&
        this.filters.basic[0].length === 1 &&
        !this.filters.basic[0][0].attribute
      ) {
        filters = null
      }

      if (this.sortingEnabled) {
        let sorting = this.filters.sorting

        if (!this.filters.sorting.attribute) {
          sorting = null
        }

        this.$emit('update-filter', filters, sorting)
      } else {
        this.$emit('update-filter', filters)
      }
    },
    resetSearch() {
      this.filters.basic = [[{ ...emptyBasicFilter }]]
      this.filters.sorting = { ...emptySorting }
      this.submitSearch()
    },
    addGroupBasicFilter() {
      this.filters.basic.push([{ ...emptyBasicFilter }])
    },
    addAndBasicFilter(groupIndex) {
      if (!this.filters.basic[groupIndex]) {
        return false
      }

      this.filters.basic[groupIndex].push({ ...emptyBasicFilter })
    },
    removeAndBasicFilter(groupIndex, filterIndex) {
      if (
        !this.filters.basic[groupIndex] ||
        !this.filters.basic[groupIndex][filterIndex]
      ) {
        return false
      }

      if (
        this.filters.basic.length === 1 &&
        this.filters.basic[0].length === 1
      ) {
        this.$set(this.filters.basic[0], 0, { ...emptyBasicFilter })
        return
      }

      if (
        this.filters.basic[groupIndex].length === 1 &&
        this.filters.basic.length > 1
      ) {
        this.filters.basic.splice(groupIndex, 1)
        return
      }

      this.filters.basic[groupIndex].splice(filterIndex, 1)
    },
    buildAttributeList(mapping, path = []) {
      let attributes = []

      for (const [attributeName, attributeValue] of Object.entries(mapping)) {
        if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'properties')
        ) {
          attributes = attributes.concat(
            this.buildAttributeList(
              attributeValue.properties,
              path.concat(attributeName)
            )
          )
        } else if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'type')
        ) {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
        }
      }

      return attributes
    }
  }
}
</script>

<style lang="scss" scoped>
a.btn {
  i.left {
    margin-right: 8px;
  }
  padding-left: 10px;
  padding-right: 10px;
  margin-left: 10px;
}

p {
  margin-bottom: 10px;
  margin-top: 10px;
  i {
    font-size: 1.1em;
    margin-right: 10px;
  }
}

.BasicFilter-orBtn {
  margin-bottom: 10px;
}

.BasicFilter-removeBtn {
  margin-top: 25px;
  color: grey;
  cursor: pointer;
}

.BasicFilter-orBlock {
  margin-left: 5px;
  margin-bottom: 5px;
}

.BasicFilter-andBlock {
  margin-bottom: 0;
  border-left: 1px dotted rgba(0, 0, 0, 0.26);
  padding-bottom: 5px;
}

.BasicFilter-sortBlock {
  margin-top: 15px;
  margin-bottom: 0;

  .block-content {
    margin-left: 5px;
    margin-bottom: 5px;
  }
}
</style>
