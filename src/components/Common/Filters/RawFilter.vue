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
            :content="filters.raw"
            :refresh-ace="refreshAce"
          />
        </b-col>
      </b-row>
      <b-alert :show="jsonInvalid" variant="danger" class="mt-2"
        >Your JSON is not valid</b-alert
      >
      <b-row no-gutters v-if="actionButtonsVisible">
        <b-col sm="12" class="text-right">
          <b-button
            variant="primary"
            class="mt-2 mr-2 mb-2"
            @click.prevent="submitSearch"
          >
            {{ submitButtonLabel }}
          </b-button>
          <b-button
            variant="outline-secondary"
            class="m-2"
            @click="resetSearch"
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
import * as filterManager from '../../../services/filterManager'

export default {
  components: {
    JsonEditor
  },
  props: {
    rawFilter: {
      type: Object,
      default() {
        return {}
      }
    },
    // TODO
    formatFromBasicSearch: Function,
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
    },
    refreshAce: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filters: {
        raw: {}
      },
      jsonInvalid: false
    }
  },
  watch: {
    rawFilter: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.filters.raw = newValue
        } else {
          this.filters.raw = {}
        }
      }
    },
    currentFilter: {
      immediate: true,
      handler() {
        this.$set(
          this.filters,
          'raw',
          filterManager.toSearchQuery(this.currentFilter)
        )
        if (this.currentFilter.raw && this.currentFilter.raw.sort) {
          this.$set(this.filters.raw, 'sort', this.currentFilter.raw.sort)
        }
      }
    }
  },
  mounted() {
    this.filters.raw = filterManager.toSearchQuery(this.currentFilter)
    if (this.currentFilter.raw && this.currentFilter.raw.sort) {
      this.$set(this.filters.raw, 'sort', this.currentFilter.raw.sort)
    }
  },
  methods: {
    submitSearch() {
      let json = this.$refs.jsoneditor.getJson()

      if (json === null) {
        this.jsonInvalid = true
        return
      }

      this.jsonInvalid = false
      this.filters.raw = json

      this.$emit('update-filter', this.filters.raw)
    },
    resetSearch() {
      this.filters.raw = null
      this.$emit('update-filter', this.filters.raw)
    }
  }
}
</script>

<style lang="scss" scoped>
#rawsearch.pre_ace {
  height: 100px;
}
</style>
