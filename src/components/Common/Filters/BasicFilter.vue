<template>
  <form>
    <div class="row filter-content">
      <div class="col s12">

        <div class="row block-and">
          <p><i class="fa fa-search"></i>Query</p>

          <div v-for="(groupIndex, group) in filters.basic" class="row block-content">
            <div v-for="(filterIndex, filter) in group" class="row dots group">
              <div class="col s4">
                <input placeholder="Attribute" type="text" class="validate" v-model="filter.attribute" @blur="updateFilter">
              </div>
              <div class="col s2">
                <select v-m-select="filter.operator" @blur="updateFilter">
                  <option value="match">Match</option>
                  <option value="not_match">Not match</option>
                  <option value="equal">Equal</option>
                  <option value="not_equal">Not equal</option>
                </select>
              </div>
              <div class="col s3">
                <input placeholder="Value" type="text" class="validate" v-model="filter.value" @blur="updateFilter">
              </div>
              <div class="col s2">
                <i class="fa fa-times remove-filter"
                   @click="removeAndBasicFilter(groupIndex, filterIndex)"></i>
                <a
                  v-if="$index === group.length - 1"
                  class="inline btn waves-effect waves-light"
                  @click="addAndBasicFilter(groupIndex)">
                  <i class="fa fa-plus left"></i>And
                </a>
              </div>
            </div>
            <p v-if="groupIndex < filters.basic.length - 1">Or</p>
          </div>

        </div>

        <div class="row">
          <a class="btn waves-effect waves-light" @click="addGroupBasicFilter">
            <i class="fa fa-plus left"></i>Or
          </a>
        </div>

        <div class="row block-sort">
          <p><i class="fa fa-sort-amount-asc"></i>Sorting</p>
          <div class="row block-content" >
            <div class="col s4">
              <input placeholder="Attribute" type="text" class="validate" v-model="filters.sorting.attribute" @blur="updateFilter">
            </div>
            <div class="col s2">
              <select v-m-select="filters.sorting.order" @blur="updateFilter">
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div class="row card-action">
      <button type="submit" class="btn waves-effect waves-light" @click.prevent="basicSearch">Search</button>
      <button class="btn waves-effect waves-light" @click="resetBasicSearch">Reset</button>
    </div>
  </form>
</template>

<script>
  const emptyBasicFilter = {attribute: null, operator: 'match', value: null}

  import MSelect from '../../Materialize/MSelect'

  export default {
    props: ['basicFilter', 'setBasicFilter'],
    directives: {
      MSelect
    },
    data () {
      return {
        filters: {
          basic: [[{...emptyBasicFilter}]],
          sorting: {
            attribute: null,
            order: 'asc'
          }
        }
      }
    },
    methods: {
      updateFilter () {
        // mandatory for not passing the ref but a deep clone. See http://vuejs.org/api/#data
        this.setBasicFilter(JSON.parse(JSON.stringify(this.filters)))
      },
      basicSearch () {
        this.$dispatch('filters-basic-search', this.filters.basic, this.filters.sorting)
      },
      resetBasicSearch () {
        this.filters.basic = [[{...emptyBasicFilter}]]
        this.filters.sorting = {attribute: null, order: 'asc'}
        this.updateFilter()
      },
      addGroupBasicFilter () {
        this.filters.basic.push([{...emptyBasicFilter}])
        this.updateFilter()
      },
      addAndBasicFilter (groupIndex) {
        this.filters.basic[groupIndex].push({...emptyBasicFilter})
        this.updateFilter()
      },
      removeAndBasicFilter (groupIndex, filterIndex) {
        if (this.filters.basic.length === 1 && this.filters.basic[0].length === 1) {
          this.filters.basic[0].$set(0, {...emptyBasicFilter})
          return
        }

        if (this.filters.basic[groupIndex].length === 1 && this.filters.basic.length > 1) {
          this.filters.basic.splice(groupIndex, 1)
          return
        }

        this.filters.basic[groupIndex].splice(filterIndex, 1)
        this.updateFilter()
      }
    },
    ready () {
      if (this.basicFilter) {
        this.filters.basic = this.basicFilter

        if (this.sorting) {
          this.filters.sorting = this.sorting
        }
      }

      this.updateFilter()
    }
  }
</script>