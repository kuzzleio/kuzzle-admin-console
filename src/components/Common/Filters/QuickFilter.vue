<template>
  <div class="QuickFilter mb-1">
    <b-row no-gutters v-if="!complexFilterActive">
      <b-col cols="6">
        <div class="QuickFilter-searchBar">
          <b-input-group>
            <b-input-group-prepend is-text>
              <i class="fa fa-search search" />
            </b-input-group-prepend>

            <auto-focus-input
              name="quick-filter"
              data-cy="QuickFilter-input"
              debounce="300"
              :placeholder="placeholder"
              type="search"
              v-model="inputSearchTerm"
              @submit="inputSubmit"
            />
          </b-input-group>
        </div>
      </b-col>
      <b-col cols="2">
        <a
          v-if="!advancedFiltersVisible"
          data-cy="QuickFilter-optionBtn"
          class="QuickFilter-optionBtn"
          href="#"
          @click.prevent="displayAdvancedFilters"
          >{{ advancedQueryLabel }}</a
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
        <b-button
          class="m-2"
          data-cy="QuickFilter-resetBtn"
          variant="outline-secondary"
          @click="resetSearch"
        >
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
          data-cy="QuickFilter-displayActiveFilters"
          variant="outline-light"
          @click.prevent="displayAdvancedFilters"
          >Display the advanced filters</b-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import AutoFocusInput from '../AutoFocusInput'

export default {
  name: 'QuickFilter',
  components: {
    AutoFocusInput
  },
  props: {
    searchTerm: String,
    advancedFiltersVisible: Boolean,
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...'
    },
    complexFilterActive: Boolean,
    enabled: Boolean,
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'Search'
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true
    },
    placeholder: {
      type: String,
      default: 'Search everywhere...'
    },
    submitOnType: {
      type: Boolean,
      default: true
    }
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
      this.$emit('reset')
    },
    displayAdvancedFilters() {
      this.$emit('display-advanced-filters')
    },
    inputSubmit () {
      this.$emit('enter-pressed')
    }
  },
  watch: {
    inputSearchTerm() {
      if (!this.submitOnType) {
        return
      }
      this.submitSearch()
    },
    searchTerm: {
      immediate: true,
      handler(val) {
        this.inputSearchTerm = val
      }
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
    margin-bottom: 0;
    width: 100%;
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
