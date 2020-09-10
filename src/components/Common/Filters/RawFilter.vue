<template>
  <form class="RawFilter">
    <b-container fluid class="mt-2">
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
import { mapGetters } from 'vuex'

export default {
  components: {
    JsonEditor
  },
  props: {
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
    ...mapGetters('kuzzle', ['wrapper']),
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
        this.$emit('filter-submitted', this.filterState)
      } else {
        this.showError = true
      }
    },
    reset() {
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss" scoped>
#rawsearch.pre_ace {
  height: 100px;
}
</style>
