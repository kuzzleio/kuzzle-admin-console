<template>
  <div class="row">
    <form class="">
      <div class="col s7">
        <div class="search-bar">
          <i class="fa fa-search search"></i>
          <div v-if="complexFilterActive || !enabled" class="chip">
            <span class="label-chip" @click.prevent="displayAdvancedFilters">{{advancedQueryLabel}}</span>
          </div>
          <input v-else type="text" placeholder="Search..." v-model="inputSearchTerm" v-focus>
          <a v-if="!advancedFiltersVisible" href="#" class="fluid-hover" @click.prevent="displayAdvancedFilters">More query options</a>
          <a v-else href="#" class="fluid-hover" @click.prevent="displayAdvancedFilters">Less query options</a>
        </div>
      </div>
      <div v-if="actionButtonsVisible" class="col s5 actions-quicksearch">
        <button type="submit" class="btn btn-small waves-effect waves-light" @click.prevent="submitSearch">{{submitButtonLabel}}</button>
        <button class="btn-flat btn-small waves-effect waves-light" @click="resetSearch">reset</button>
      </div>
    </form>
  </div>
</template>

<script>
import Focus from '../../../directives/focus.directive'

export default {
  name: 'QuickFilter',
  props: {
    searchTerm: String,
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...'
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
    complexFilterActive: Boolean,
    advancedFiltersVisible: Boolean,
    enabled: Boolean
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
      if (this.complexFilterActive) {
        this.$emit('refresh')
      } else {
        this.$emit('update-filter', this.inputSearchTerm)
      }
    },
    resetSearch() {
      this.$emit('reset')
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
