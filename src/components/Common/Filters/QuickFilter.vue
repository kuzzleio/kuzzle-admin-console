<template>
  <div class="QuickFilter">
    <b-row v-if="!complexFilterActive" no-gutters>
      <b-col cols="6">
        <div class="QuickFilter-searchBar">
          <b-input-group>
            <b-input-group-prepend is-text>
              <i class="fa fa-search search" />
            </b-input-group-prepend>
            <div class="QuickFilter-searchBar-input-wrapper">
              <b-form-input
                autofocus
                data-cy="QuickFilter-input"
                debounce="600"
                type="search"
                :value="value"
                :placeholder="placeholder"
                @input="onInput"
                @keyup.enter="submit"
              />
            </div>
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
        <a v-else class="QuickFilter-optionBtn" href="#" @click.prevent="displayAdvancedFilters"
          >Less query options</a
        >
      </b-col>

      <b-col v-if="actionButtonsVisible" class="text-right" cols="4">
        <b-button type="submit" class="m-2" variant="primary" @click.prevent="submitSearch">
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
    <div v-else class="QuickFilter-warning mx-4 mb-3">
      <div class="align-middle QuickFilter-warning-message">
        <b-row align-v="center">
          <b-button
            data-cy="QuickFilter-displayActiveFilters"
            variant="outline-info"
            @click.prevent="displayAdvancedFilters"
          >
            <i class="fa left fa-filter mr-2" />{{
              advancedFiltersVisible ? 'Hide filters' : 'Show filters'
            }}</b-button
          >
          <b-badge v-if="!advancedFiltersVisible" pill variant="info" class="ml-2 py-2 px-3" align-v
            >Filters are being applied</b-badge
          >
        </b-row>
      </div>
      <b-row>
        <b-button
          class="align-right d-inline ml-3"
          data-cy="QuickFilter-resetBtn"
          variant="outline-secondary"
          @click="resetSearch"
        >
          Reset
        </b-button>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickFilter',
  props: {
    advancedFiltersVisible: Boolean,
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...',
    },
    complexFilterActive: Boolean,
    enabled: Boolean,
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'Search',
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true,
    },
    placeholder: {
      type: String,
      default: 'Search everywhere...',
    },
    submitOnType: {
      type: Boolean,
      default: true,
    },
    value: {
      type: String,
    },
  },
  methods: {
    submit() {
      this.$emit('submit', this.value);
    },
    resetSearch() {
      this.$emit('reset');
    },
    displayAdvancedFilters() {
      this.$emit('display-advanced-filters');
    },
    onInput(term) {
      this.$emit(this.submitOnType ? 'submit' : 'input', term);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss';

.QuickFilter {
  margin-bottom: 0;
  color: #002835;
}
.QuickFilter-searchBar {
  position: relative;
  height: 48px;
  border-bottom: solid 1px #e4e1e1;

  &-input-wrapper {
    width: 90%;

    input {
      height: 48px;
      margin-bottom: 0;
      width: 100%;
      box-sizing: border-box;
      border-bottom: solid 1px #e4e1e1;
    }
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
  color: variables.$primary-color;
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

.QuickFilter-warning-message {
  display: flex;
  flex-direction: row;
  justify-items: center;
}

.QuickFilter-warning-icon {
  color: #ffc107;
}

.QuickFilter-displayActiveFilters {
  color: #002835;
  border-width: 2px;
}
</style>
