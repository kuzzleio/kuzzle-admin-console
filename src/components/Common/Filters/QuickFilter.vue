<template>
  <div class="QuickFilter row">
    <form>
      <div class="col s7">
        <div class="QuickFilter-searchBar">
          <i class="QuickFilter-searchIcon fa fa-search search"></i>
          <div v-if="complexFilterActive || !enabled" class="QuickFilter-chip chip">
            <span class="QuickFilter-chipLabel" @click.prevent="displayAdvancedFilters">{{advancedQueryLabel}}</span>
          </div>
          <input v-else type="text" placeholder="Search..." v-model="inputSearchTerm" v-focus>
          <a class="QuickFilter-optionBtn fluid-hover" v-if="!advancedFiltersVisible" href="#" @click.prevent="displayAdvancedFilters">More query options</a>
          <a class="QuickFilter-optionBtn fluid-hover" v-else href="#" @click.prevent="displayAdvancedFilters">Less query options</a>
        </div>
      </div>
      <div v-if="actionButtonsVisible" class="QuickFilter-actions col s5">
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

.QuickFilter-chip {
  margin-top: 9px;
  margin-left: 30px;
  cursor: pointer;

  .QuickFilter-chipLabel {
    display: inline-block;
    padding-right: 10px;
  }
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
