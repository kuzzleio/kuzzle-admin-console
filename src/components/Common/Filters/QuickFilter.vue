<template>
  <div class="QuickFilter row">
    <form>
      <div class="col s8 l8 xl8">
        <div class="QuickFilter-searchBar">
          <i class="QuickFilter-searchIcon fa fa-search search" />
          <div
            v-if="complexFilterActive || !enabled"
            class="QuickFilter-chip chip"
          >
            <span
              class="QuickFilter-chipLabel"
              @click.prevent="displayAdvancedFilters"
            >{{ advancedQueryLabel }}</span>
          </div>
          <input
            v-else
            v-model="inputSearchTerm"
            v-focus
            type="text"
            placeholder="Search..."
            @input="submitSearch"
          >
          <a
            v-if="!advancedFiltersVisible"
            class="QuickFilter-optionBtn fluid-hover"
            href="#"
            @click.prevent="displayAdvancedFilters"
          >More query options</a>
          <a
            v-else
            class="QuickFilter-optionBtn fluid-hover"
            href="#"
            @click.prevent="displayAdvancedFilters"
          >Less query options</a>
        </div>
      </div>
      <div
        v-if="actionButtonsVisible"
        class="QuickFilter-actions col s4 l4 xl4"
      >
        <button
          type="submit"
          class="QuickFilter-submitBtn btn btn-small waves-effect waves-light"
          @click.prevent="submitSearch"
        >
          {{ submitButtonLabel }}
        </button>
        <button
          class="QuickFilter-resetBtn btn-flat btn-small waves-effect waves-light"
          @click="resetSearch"
        >
          reset
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import Focus from '../../../directives/focus.directive'

export default {
  name: 'QuickFilter',
  directives: {
    Focus
  },
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
  data() {
    return {
      inputSearchTerm: this.searchTerm,
      throttleSearch: false,
      lastThrottledSearch: null
    }
  },
  watch: {
    searchTerm: {
      immediate: true,
      handler(value) {
        this.inputSearchTerm = value
      }
    }
  },
  methods: {
    submitSearch() {
      if (this.throttleSearch) {
        // Keep the last throttled search to replay it when user stop typing
        this.lastThrottledSearch = this.inputSearchTerm
        return
      }

      this.throttleSearch = true
      setTimeout(() => {
        this.throttleSearch = false

        if (this.lastThrottledSearch) {
          this.submitSearch()
        }
      }, 300)

      if (this.complexFilterActive) {
        this.$emit('refresh')
      } else {
        this.$emit('update-filter', this.inputSearchTerm)
      }

      this.lastThrottledSearch = null
    },
    resetSearch() {
      this.$emit('reset')
    },
    displayAdvancedFilters() {
      this.$emit('display-advanced-filters')
    }
  }
}
</script>

<style lang="scss" scoped>
.QuickFilter {
  margin-bottom: 0;
}
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
