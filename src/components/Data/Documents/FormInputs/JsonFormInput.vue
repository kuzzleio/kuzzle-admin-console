<template>
  <Card class="w-full">
    <CardContent class="flex flex-col gap-4 lg:flex-row">
      <json-editor
        :id="schema.label"
        class="h-full lg:w-8/12"
        :content="JSON.stringify(value, null, 2) || '{}'"
        @change="onChange"
      />
      <pre
        v-json-formatter="{ content: schema.mapping, open: true }"
        class="mb-0 overflow-auto lg:w-4/12"
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
