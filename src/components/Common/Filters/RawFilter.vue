<template>
  <form class="RawFilter">
    <b-container fluid class="mt-2">
      <b-row no-gutters v-if="currentFilter.basic" class="blue lighten-3">
        A Basic filter is currently active. This shows your basic filter as raw
        filter. If you modify this raw filter it will not change the basic
        filter view and will reset this raw filter to the original content of
        the basic filter.
      </b-row>
      <b-row no-gutters>
        <b-col cols="12">
          <json-editor
            id="rawsearch"
            ref="jsoneditor"
            myclass="pre_ace"
            :content="rawFilter"
            @change="onFilterChange"
          />
        </b-col>
      </b-row>
      <b-alert :show="!isFilterValid && showError" variant="danger" class="mt-2"
        >Your JSON filter contains errors.</b-alert
      >
      <b-row no-gutters v-if="actionButtonsVisible">
        <b-col sm="12" class="text-right">
          <b-button
            class="mt-2 mr-2 mb-2"
            data-cy="RawFilter-submitBtn"
            variant="primary"
            :disabled="!isFilterValid"
            @click.prevent="submit"
          >
            {{ submitButtonLabel }}
          </b-button>
          <b-button
            class="ml-2"
            data-cy="RawFilter-resetBtn"
            variant="outline-secondary"
            @click="reset"
          >
            Reset
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </form>
</template>

<script>
import JsonEditor from '../../Common/JsonEditor'
import { formatFromBasicSearch } from '../../../services/filterManager'

export default {
  components: {
    JsonEditor
  },
  props: {
    formatFromBasicSearch: { type: Function, default: formatFromBasicSearch },
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
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    currentFilter: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      rawFilter: '{}',
      showError: false
    }
  },
  computed: {
    filterState() {
      try {
        return JSON.parse(this.rawFilter)
      } catch (error) {
        return {}
      }
    },
    isFilterValid() {
      try {
        JSON.parse(this.rawFilter)
        return true
      } catch (error) {
        return false
      }
    }
  },
  methods: {
    onFilterChange(val) {
      this.rawFilter = val
    },
    submit() {
      if (this.isFilterValid) {
        this.showError = false
        this.$emit('update-filter', this.filterState)
      } else {
        this.showError = true
      }
    },
    reset() {
      this.$emit('reset')
    }
  },
  watch: {
    currentFilter: {
      immediate: true,
      handler(val) {
        if (!val) {
          return
        }
        if (val.basic) {
          this.rawFilter = JSON.stringify(
            this.formatFromBasicSearch(val.basic),
            null,
            2
          )
        }
        if (!val.raw) {
          return
        }
        this.rawFilter = JSON.stringify(val.raw, null, 2)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#rawsearch.pre_ace {
  height: 100px;
}
</style>
