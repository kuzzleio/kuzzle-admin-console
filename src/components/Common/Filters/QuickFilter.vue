<template>
  <div class="QuickFilter">
    <b-row no-gutters v-if="!complexFilterActive">
      <b-col cols="6">
        <div class="QuickFilter-searchBar">
          <b-input-group>
            <b-input-group-prepend is-text>
              <i class="fa fa-search search" />
            </b-input-group-prepend>

            <b-form-input
              v-model="inputSearchTerm"
              v-focus
              type="search"
              placeholder="Search..."
              @input="submitSearch"
            >
            </b-form-input>
          </b-input-group>
        </div>
      </b-col>
      <b-col cols="2">
        <a
          v-if="!advancedFiltersVisible"
          class="QuickFilter-optionBtn"
          href="#"
          @click.prevent="displayAdvancedFilters"
          >More query options</a
        >
        <a
          v-else
          class="QuickFilter-optionBtn"
          href="#"
          @click.prevent="displayAdvancedFilters"
          >Less query options</a
        >
      </b-col>

      <b-col v-if="actionButtonsVisible" class="text-right" cols="4">
        <b-button
          type="submit"
          class="m-2"
          variant="primary"
          @click.prevent="submitSearch"
        >
          {{ submitButtonLabel }}
        </b-button>
        <b-button class="m-2" variant="outline-secondary" @click="resetSearch">
          Reset
        </b-button>
      </b-col>
    </b-row>
    <div v-else class="QuickFilter-warning mx-3 mb-2 font-weight-bold">
      <div class="align-middle pt-2">
        Warning: a filter has been set, some documents might be hidden.
      </div>
      <div>
        <b-button
          class="align-middle d-inline ml-3 font-weight-bold"
          variant="outline-light"
          @click.prevent="displayAdvancedFilters"
          >Display the advanced filters.</b-button
        >
      </div>
    </div>
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
  color: $primary-color;
}

.QuickFilter-actions {
  height: 48px;
  line-height: 48px;
}

.QuickFilter-warning {
  display: flex;
  flex-direction: row;
  justify-items: center;
  justify-content: space-between;
}
</style>
