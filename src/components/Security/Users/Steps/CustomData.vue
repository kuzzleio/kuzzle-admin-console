<template>
  <div class="document-create-update">
    <form class="wrapper" @submit.prevent="submit">
      Here, you can define the custom content of your users. The fields you define here will appear
      in the <code>content</code> field of your user object, along with <code>profileIds</code> and
      <code>_kuzzle_info</code>.
      <div class="tw:mt-3 tw:flex tw:flex-col tw:gap-6 tw:lg:flex-row">
        <!-- Json view -->
        <div class="tw:lg:w-8/12">
          <h3>Custom content</h3>
          <json-editor
            ref="jsoneditor"
            class="document-json"
            :content="value"
            data-cy="UserCustomContent-jsonEditor"
            :height="300"
            @change="jsonChanged"
          />
        </div>

        <!-- Mapping -->
        <div class="tw:lg:w-4/12">
          <h3>Mapping</h3>
          <pre
            v-json-formatter="{
              content: mapping,
              open: true,
            }"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import JsonFormatter from '@/directives/json-formatter.directive';
import { mergeSchemaMapping } from '@/services/collectionHelper';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'CustomData',
  components: {
    JsonEditor,
  },
  directives: { JsonFormatter },
  props: {
    value: {
      type: String,
      default: '',
    },
    mapping: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      viewType: 'form',
      newContent: {},
    };
  },
  computed: {
    isFormView() {
      return this.viewType === 'form';
    },
    schema() {
      return mergeSchemaMapping({}, this.mapping);
    },
  },
  methods: {
    jsonChanged(value) {
      this.$emit('input', value);
    },
  },
};
</script>
