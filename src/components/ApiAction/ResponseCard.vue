<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle>Response</CardTitle>
    </CardHeader>
    <CardContent class="flex min-h-0 flex-1 flex-col gap-2">
      <Alert :variant="statusBarVariant">
        <p :data-cy="`api-actions-response-status-${tabIdx}`">Status: {{ currentStatus }}</p>
        <p v-if="currentErrorMessage" class="mt-1">{{ currentErrorMessage }}</p>
      </Alert>

      <JsonEditor
        :id="`responseEditorWrapper-${tabIdx}`"
        ref="responseEditor"
        class="responseJsonEditor min-h-0 flex-1"
        content="{}"
        :data-cy="`api-actions-response-JSONEditor-${tabIdx}`"
        readonly
      />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue';
import _ from 'lodash';

import type { QueryResponse } from '@/components/ApiAction/types';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import JsonEditor from '@/components/Common/JsonEditor.vue';

const props = withDefaults(
  defineProps<{
    response?: QueryResponse;
    tabIdx: number;
  }>(),
  { response: '' },
);

const responseEditor = useTemplateRef<InstanceType<typeof JsonEditor>>('responseEditor');

const currentStatus = computed((): unknown =>
  props.response ? _.get(props.response, 'status', 'undefined') : null,
);
const currentErrorMessage = computed((): unknown =>
  typeof props.response === 'object' ? Reflect.get(props.response, 'message') : null,
);
const statusBarVariant = computed((): 'default' | 'destructive' | 'success' => {
  if (currentStatus.value === null || currentStatus.value === 'undefined') return 'default';
  if (String(currentStatus.value).match(/20[0-9]/) != null) return 'success';
  return 'destructive';
});

watch(
  () => props.response,
  (value) => {
    responseEditor.value?.setContent(JSON.stringify(value, null, ' '));
  },
);
</script>

<style lang="scss" scoped>
.responseJsonEditor {
  height: calc(100% - 74px) !important;
}
</style>
