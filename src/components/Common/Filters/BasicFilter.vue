<template>
  <form class="BasicFilter" @submit.prevent="submitSearch">
    <div class="row">
      <div class="col s12">

        <div class="BasicFilter-query row">
          <p><i class="fa fa-search"></i>Query</p>

          <div v-for="(orBlock, groupIndex) in filters.basic" v-bind:key="`orBlock-${groupIndex}`" class="BasicFilter-orBlock row">
            <div v-for="(andBlock, filterIndex) in orBlock" v-bind:key="`andBlock-${filterIndex}`" class="BasicFilter-andBlock row dots">
              <div class="col s4">
                <autocomplete
                  input-class="validate"
                  placeholder="Attribute"
                  :items="attributeItems"
                  :value="filters.basic[groupIndex][filterIndex].attribute || ''"
                  @autocomplete::change="(attribute) => selectAttribute(attribute, groupIndex, filterIndex)"
                />
              </div>
              <div class="col s3">
                <m-select v-model="andBlock.operator">
                  <option v-for="(label, identifiers) in availableOperands" :value="identifiers" v-bind:key="label">{{label}}</option>
                </m-select>
              </div>
              <div v-if="andBlock.operator !== 'range'">
                <div class="col s3">
                  <input placeholder="Value" type="text" class="validate" v-model="andBlock.value">
                </div>
              </div>
              <div v-else>
                <div class="col s1">
                  <input placeholder="Value 1" type="text" class="validate" v-model="andBlock.gt_value">
                </div>
                <div class="col s1">
                  <input placeholder="Value 2" type="text" class="validate" v-model="andBlock.lt_value">
                </div>
              </div>
              <div class="col s2">
                <i class="BasicFilter-removeBtn fa fa-times"
                   @click="removeAndBasicFilter(groupIndex, filterIndex)"></i>
                <a
                  v-if="filterIndex === orBlock.length - 1"
                  class="BasicFilter-andBtn inline btn btn-small waves-effect waves-light"
                  @click="addAndBasicFilter(groupIndex)">
                  <i class="fa fa-plus left"></i>And
                </a>
              </div>
            </div>
            <p v-if="groupIndex < filters.basic.length - 1">Or</p>
          </div>
        </div>

        <div class="BasicFilter-orBtn row">
          <a class="btn btn-small waves-effect waves-light" @click="addGroupBasicFilter">
            <i class="fa fa-plus left"></i>Or
          </a>
        </div>

        <div class="BasicFilter-sortBlock row" v-if="sortingEnabled">
          <p><i class="fa fa-sort-amount-asc"></i>Sorting</p>
          <div class="row block-content" >
            <div class="col s4">
              <input placeholder="Attribute" type="text" class="BasicFilter-sortingAttr validate" v-model="filters.sorting.attribute">
            </div>
            <div class="BasicFilter-sortingValue col s2">
              <m-select v-model="filters.sorting.order">
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </m-select>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div v-if="actionButtonsVisible" class="row card-action">
      <button type="submit" class="BasicFilter-submitBtn btn waves-effect waves-light primary" @click.prevent="submitSearch">{{submitButtonLabel}}</button>
      <button class="BasicFilter-resetBtn btn-flat waves-effect waves-light" @click="resetSearch">Reset</button>
    </div>
  </form>
</template>

<script>
import MSelect from '../../Common/MSelect'
import Autocomplete from '../Autocomplete'

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
    }
  },
  components: {
    MSelect,
    Autocomplete
  },
  data() {
    return {
      filters: {
        basic: null,
        sorting: { ...emptySorting }
      }
    }
  },
  computed: {
    attributeItems() {
      return this.buildAttributeList(this.collectionMapping)
    },
    isFilterValid: function() {
      // For each andBlocks in orBlocks, check if attribute and value field are filled
      for (const orBlock of this.filters.basic) {
        for (const andBlock of orBlock) {
          if (
            (!andBlock.attribute && andBlock.value) ||
            (andBlock.attribute && (!andBlock.value) && (!andBlock.lt_value && !andBlock.gt_value))
          ) {
            return false
          }
        }
      }

      return true
    }
  },
  methods: {
    selectAttribute(attribute, groupIndex, filterIndex) {
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
        if (attributeValue.hasOwnProperty('properties')) {
          attributes = attributes.concat(
            this.buildAttributeList(
              attributeValue.properties,
              path.concat(attributeName)
            )
          )
        } else if (attributeValue.hasOwnProperty('type')) {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
        }
      }

      return attributes
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
  mounted() {}
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
