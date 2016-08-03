<template>
  <div class="row">
    <form>
      <div class="col s7">
        <div class="search-bar">
          <i class="fa fa-search search"></i>
          <input type="text" placeholder="Search something..." v-model="filters.searchTerm"/>
          <a href="#" @click.prevent="displayComplexSearch">More query options</a>
          <i class="fa fa-times remove-search" @click="resetQuickSearch"></i>
        </div>
      </div>
      <div class="col s3">
        <button type="submit" class="btn waves-effect waves-light" @click.prevent="quickSearch">Search</button>
      </div>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'QuickSearch',
    props: ['searchTerm'],
    data () {
      return {
        filters: {
          searchTerm: null
        }
      }
    },
    methods: {
      quickSearch () {
        this.$dispatch('filters-quick-search', this.filters.searchTerm)
      },
      resetQuickSearch () {
        this.filters.searchTerm = null
        this.$dispatch('filters-quick-search', null)
      },
      displayComplexSearch () {
        this.$dispatch('filters-display-block-filter')
      }
    },
    ready () {
      this.filters.searchTerm = this.searchTerm
    }
  }
</script>