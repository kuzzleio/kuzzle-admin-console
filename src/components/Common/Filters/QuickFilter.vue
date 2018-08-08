<template>
  <div class="row">
    <form class="">
      <div class="col s7">
        <div class="search-bar">
          <i class="fa fa-search search"></i>
          <div v-if="complexFilterActive" class="chip">
              <span class="label-chip" @click.prevent="advancedFiltersVisible = true">Advanced query...</span>
              <i class="close fa fa-close" v-if="simpleFilterEnabled" @click.prevent="resetComplexSearch"></i>
            </div>
          <input v-if="!complexFilterActive" type="text" placeholder="Search..." v-model="inputSearchTerm" v-focus>
          <a v-if="!advancedFiltersVisible" href="#" class="fluid-hover" @click.prevent="displayAdvancedFilters">More query options</a>
          <a v-else href="#" class="fluid-hover" @click.prevent="displayAdvancedFilters">Less query options</a>
        </div>
      </div>
      <div class="col s5 actions-quicksearch">
        <button type="submit" class="btn btn-small waves-effect waves-light" @click.prevent="submitSearch">Search</button>
        <button class="btn-flat btn-small waves-effect waves-light" @click="resetSearch">reset</button>
      </div>
    </form>
  </div>
</template>

<script>
import Focus from '../../../directives/focus.directive'
import { DEFAULT_QUICK } from '../../../services/filterManager'

export default {
  name: 'QuickFilter',
  props: {
    complexFilterActive: Boolean,
    searchTerm: String,
    advancedFiltersVisible: Boolean
  },
  directives: {
    Focus
  },
  data() {
    return {
      inputSearchTerm: this.searchTerm
    }
  },
  methods: {
    submitSearch() {
      this.$emit('update-filter', this.inputSearchTerm)
    },
    resetSearch() {
      this.inputSearchTerm = DEFAULT_QUICK
      this.submitSearch()
    },
    displayAdvancedFilters() {
      this.$emit('display-advanced-filters')
    }
  },
  watch: {
    searchTerm: {
      immediate: true,
      handler(newValue, oldValue) {
        this.inputSearchTerm = newValue
      }
    }
  }
}
</script>
