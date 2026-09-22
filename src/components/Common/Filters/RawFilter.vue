<template>
  <form class="RawFilter" data-cy="RawFilter">
    <json-editor
      id="rawsearch"
      ref="jsoneditor"
      class="JsonEditor"
      myclass="pre_ace"
      :content="rawFilter"
      @change="onFilterChange"
    />
    <Alert v-if="!isFilterValid && showError" class="mt-2" variant="destructive">
      Your JSON filter contains errors.
    </Alert>
    <div v-if="actionButtonsVisible" class="mt-3 flex justify-end gap-2">
      <Button data-cy="RawFilter-resetBtn" variant="outline" @click="reset">Reset</Button>
      <Button data-cy="RawFilter-submitBtn" :disabled="!isFilterValid" @click.prevent="submit">
        {{ submitButtonLabel }}
      </Button>
    </div>
  </form>
</template>

<script>
import { mapState } from 'pinia';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useKuzzleStore } from '@/stores';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  components: {
    Alert,
    Button,
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
