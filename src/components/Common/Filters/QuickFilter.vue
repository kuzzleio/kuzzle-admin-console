<template>
  <div class="row">
    <form class="">
      <div class="col s7">
        <div class="search-bar">
          <i class="fa fa-search search"></i>
          <input type="text" placeholder="Search..." v-model="filters.searchTerm" v-focus />
          <a v-if="!displayBlockFilter" href="#" class="fluid-hover" @click.prevent="displayComplexSearch">More query options</a>
          <a v-else href="#" class="fluid-hover" @click.prevent="displayComplexSearch">Less query options</a>
        </div>
      </div>
      <div class="col s5 actions-quicksearch">
        <button type="submit" class="btn btn-small waves-effect waves-light" @click.prevent="quickSearch">Search</button>
        <button class="btn-flat btn-small waves-effect waves-light" @click="resetQuickSearch">reset</button>
      </div>
    </form>
  </div>
</template>

<script>
  import Focus from '../../../directives/focus.directive'

  export default {
    name: 'QuickFilter',
    props: ['searchTerm', 'displayBlockFilter'],
    directives: {
      Focus
    },
    data () {
      return {
        filters: {
          searchTerm: null
        }
      }
    },
    methods: {
      quickSearch () {
        this.$emit('quick-search', this.filters.searchTerm)
      },
      resetQuickSearch () {
        this.filters.searchTerm = null
        this.$emit('quick-search', null)
      },
      displayComplexSearch () {
        this.$emit('display-advanced-filter')
      }
    },
    mounted () {
      this.filters.searchTerm = this.searchTerm
    }
  }
</script>
