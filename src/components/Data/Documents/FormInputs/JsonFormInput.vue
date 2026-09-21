<template>
  <Card class="tw:w-full">
    <CardContent class="tw:flex tw:flex-col tw:gap-4 tw:lg:flex-row">
      <json-editor
        :id="schema.label"
        class="tw:h-full tw:lg:w-8/12"
        :content="JSON.stringify(value, null, 2) || '{}'"
        @change="onChange"
      />
      <pre
        v-json-formatter="{ content: schema.mapping, open: true }"
        class="tw:mb-0 tw:overflow-auto tw:lg:w-4/12"
      />
    </CardContent>
  </Card>
</template>

<script>
// https://vue-generators.gitbook.io/vue-generators/fields/custom_fields
import { abstractField } from 'vue-form-generator';

import { Card, CardContent } from '@/components/ui/card';
import JsonFormatter from '@/directives/json-formatter.directive';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  directives: {
    JsonFormatter,
  },
  components: {
    Card,
    CardContent,
    JsonEditor,
  },
  mixins: [abstractField],
  methods: {
    onChange(jsonString) {
      try {
        this.value = JSON.parse(jsonString);
      } catch (err) {
        // do nothing...
        // if the JSON is invalid, no need to trigger form change event
      }
    },
  },
};
</script>
