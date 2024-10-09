<template>
  <form class="RawFilter">
    <json-editor
      id="rawsearch"
      ref="jsoneditor"
      class="JsonEditor"
      myclass="pre_ace"
      :content="rawFilter"
      @change="onFilterChange"
    />
    <b-alert :show="!isFilterValid && showError" variant="danger" class="mt-2"
      >Your JSON filter contains errors.</b-alert
    >
    <b-row v-if="actionButtonsVisible" no-gutters>
      <b-col sm="12" class="text-right">
        <b-button
          class="mr-2"
          data-cy="RawFilter-resetBtn"
          variant="outline-secondary"
          @click="reset"
        >
          Reset
        </b-button>
        <b-button
          class="mt-2 mb-2"
          data-cy="RawFilter-submitBtn"
          variant="primary"
          :disabled="!isFilterValid"
          @click.prevent="submit"
        >
          {{ submitButtonLabel }}
        </b-button>
      </b-col>
    </b-row>
  </form>
</template>

<script>
import { mapState } from 'pinia';

import { useKuzzleStore } from '@/stores';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  components: {
    JsonEditor,
  },
  props: {
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
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    currentFilter: {
      type: Object,
      required: false,
      default: () => {
        return {};
      },
    },
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      rawFilter: `{
  "query": {},
  "sort": {}
}`,
      showError: false,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
    filterState() {
      try {
        return JSON.parse(this.rawFilter);
      } catch (error) {
        return {};
      }
    },
    isFilterValid() {
      try {
        JSON.parse(this.rawFilter);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
  watch: {
    currentFilter: {
      immediate: true,
      handler(val) {
        if (!val) {
          return;
        }
        if (!val.raw) {
          return;
        }
        this.rawFilter = JSON.stringify(val.raw, null, 2);
      },
    },
  },
  methods: {
    onFilterChange(val) {
      this.rawFilter = val;
    },
    submit() {
      if (this.isFilterValid) {
        this.showError = false;
        this.$emit('filter-submitted', this.filterState);
      } else {
        this.showError = true;
      }
    },
    reset() {
      this.$emit('reset');
    },
  },
};
</script>

<style lang="scss" scoped>
.RawFilter {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.JsonEditor {
  flex-grow: 1;
}
</style>
