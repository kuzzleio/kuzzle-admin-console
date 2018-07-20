<template>
  <form @submit.prevent="basicSearch">
    <div class="row filter-content">
      <div class="col s12">

        <div class="row block-and">
          <p><i class="fa fa-search"></i>Query</p>

          <div v-for="(group, groupIndex) in filters.basic" class="row block-content">
            <div v-for="(filter, filterIndex) in group" class="row dots group">
              <div class="col s4">
                <input placeholder="Attribute" type="text" class="validate" v-model="filter.attribute">
              </div>
              <div class="col s3">
                <m-select v-model="filter.operator">
                  <option v-for="(label, identifiers) in availableFilters" :value="identifiers">{{label}}</option>
                </m-select>
              </div>
              <div class="col s3">
                <input placeholder="Value" type="text" class="validate" v-model="filter.value">
              </div>
              <div class="col s2">
                <i class="fa fa-times remove-filter"
                   @click="removeAndBasicFilter(groupIndex, filterIndex)"></i>
                <a
                  v-if="filterIndex === group.length - 1"
                  class="inline btn btn-small waves-effect waves-light"
                  @click="addAndBasicFilter(groupIndex)">
                  <i class="fa fa-plus left"></i>And
                </a>
              </div>
            </div>
            <p v-if="groupIndex < filters.basic.length - 1">Or</p>
          </div>
        </div>

        <div class="row button-or">
          <a class="btn btn-small waves-effect waves-light" @click="addGroupBasicFilter">
            <i class="fa fa-plus left"></i>Or
          </a>
        </div>

        <div class="row block-sort" v-if="sortingEnabled">
          <p><i class="fa fa-sort-amount-asc"></i>Sorting</p>
          <div class="row block-content" >
            <div class="col s4">
              <input placeholder="Attribute" type="text" class="validate" v-model="filters.sorting.attribute">
            </div>
            <div class="col s2">
              <m-select v-model="filters.sorting.order">
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </m-select>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div class="row card-action">
      <button type="submit" class="btn waves-effect waves-light primary" @click.prevent="basicSearch">{{labelSearchButton}}</button>
      <button class="btn-flat waves-effect waves-light" @click="resetBasicSearch">Reset</button>
    </div>
  </form>
</template>

<script>
  const emptyBasicFilter = {attribute: null, operator: 'match', value: null}
  const emptySorting = {attribute: null, order: 'asc'}

  import MSelect from '../../Common/MSelect'

  export default {
    props: {
      basicFilter: Array,
      sorting: Object,
      setBasicFilter: Function,
      availableFilters: {
        type: Object,
        required: true
      },
      labelSearchButton: {
        type: String,
        required: false,
        'default': 'search'
      },
      sortingEnabled: {
        type: Boolean,
        required: false,
        'default': true
      }
    },
    components: {
      MSelect
    },
    data () {
      return {
        filters: {
          basic: null,
          sorting: {...emptySorting}
        }
      }
    },
    methods: {
      basicSearch () {
        let filters = this.filters.basic

        if (this.filters.basic.length === 1 &&
          this.filters.basic[0].length === 1 &&
          !this.filters.basic[0][0].attribute) {
          filters = null
        }

        if (this.sortingEnabled) {
          let sorting = this.filters.sorting

          if (!this.filters.sorting.attribute) {
            sorting = null
          }

          this.$emit('filters-basic-search', filters, sorting)
        } else {
          this.$emit('filters-basic-search', filters)
        }
      },
      resetBasicSearch () {
        this.filters.basic = [[{...emptyBasicFilter}]]
        this.filters.sorting = {...emptySorting}
      },
      addGroupBasicFilter () {
        this.filters.basic.push([{...emptyBasicFilter}])
      },
      addAndBasicFilter (groupIndex) {
        if (!this.filters.basic[groupIndex]) {
          return false
        }

        this.filters.basic[groupIndex].push({...emptyBasicFilter})
      },
      removeAndBasicFilter (groupIndex, filterIndex) {
        if (!this.filters.basic[groupIndex] || !this.filters.basic[groupIndex][filterIndex]) {
          return false
        }

        if (this.filters.basic.length === 1 && this.filters.basic[0].length === 1) {
          this.$set(this.filters.basic[0], 0, {...emptyBasicFilter})
          return
        }

        if (this.filters.basic[groupIndex].length === 1 && this.filters.basic.length > 1) {
          this.filters.basic.splice(groupIndex, 1)
          return
        }

        this.filters.basic[groupIndex].splice(filterIndex, 1)
      }
    },
    mounted () {
      this.filters.basic = this.basicFilter || [[{...emptyBasicFilter}]]
      this.filters.sorting = this.sorting || {...emptySorting}
    }
  }
</script>
