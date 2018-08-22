<template>
  <div class="QuickFilter row">
    <form class="">
      <div class="col s7">
        <div class="QuickFilter-searchBar">
          <i class="QuickFilter-searchIcon fa fa-search search"></i>
          <input type="text" placeholder="Search..." v-model="filters.searchTerm" v-focus />
          <a class="QuickFilter-optionBtn fluid-hover" v-if="!displayBlockFilter" href="#" @click.prevent="displayComplexSearch">More query options</a>
          <a class="QuickFilter-optionBtn fluid-hover" v-else href="#" @click.prevent="displayComplexSearch">Less query options</a>
        </div>
      </div>
      <div class="QuickFilter-actions col s3">
        <button type="submit" class="btn btn-small waves-effect waves-light" @click.prevent="quickSearch">Search</button>
        <button class="btn-flat btn-small waves-effect waves-light" @click="resetQuickSearch">reset</button>
      </div>
    </form>
  </div>
</template>

<script>
import Focus from '../../../../directives/focus.directive'

export default {
  name: 'QuickFilter',
  props: ['searchTerm', 'displayBlockFilter'],
  directives: {
    Focus
  },
  data() {
    return {
      filters: {
        searchTerm: null
      }
    }
  },
  methods: {
    quickSearch() {
      this.$emit('filters-quick-search', this.filters.searchTerm)
    },
    resetQuickSearch() {
      this.filters.searchTerm = null
      this.$emit('filters-quick-search', null)
    },
    displayComplexSearch() {
      this.$emit('filters-display-block-filter')
    }
  },
  mounted() {
    this.filters.searchTerm = this.searchTerm
  }
}
</script>

<style lang="scss" scoped>
.QuickFilter-searchBar {
  position: relative;
  height: 48px;
  border-bottom: solid 1px #e4e1e1;

  input {
    height: 48px;
    padding-left: 34px;
    margin-bottom: 0;
    width: 100%;
    padding-right: 215px;
    box-sizing: border-box;
    border-bottom: solid 1px #e4e1e1;
  }
}

.QuickFilter-searchIcon {
  position: absolute;
  font-size: 1.3rem;
  margin-left: 4px;
  color: grey;
  top: 50%;
  transform: translateY(-50%);
}

.QuickFilter-optionBtn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  text-decoration: underline;
}

.QuickFilter-actions {
  height: 48px;
  line-height: 48px;
}
</style>
