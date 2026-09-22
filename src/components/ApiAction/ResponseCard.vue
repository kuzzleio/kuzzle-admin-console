<template>
  <Card class="tw:h-full">
    <CardHeader>
      <CardTitle>Response</CardTitle>
    </CardHeader>
    <CardContent class="tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-2">
      <Alert :variant="statusBarVariant">
        <p :data-cy="`api-actions-response-status-${tabIdx}`">Status: {{ currentStatus }}</p>
        <p v-if="currentErrorMessage" class="tw:mt-1">{{ currentErrorMessage }}</p>
      </Alert>

      <json-editor
        :id="`responseEditorWrapper-${tabIdx}`"
        :ref="`responseEditorWrapper-${tabIdx}`"
        class="responseJsonEditor tw:min-h-0 tw:flex-1"
        content="{}"
        :data-cy="`api-actions-response-JSONEditor-${tabIdx}`"
        readonly
      />
    </CardContent>
  </Card>
</template>

<script>
import _ from 'lodash';

import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import jsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  components: {
    Alert,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    jsonEditor,
  },
  props: {
    response: {
      default: '',
    },
    tabIdx: {},
  },
  data() {
    return {
      isFullScreen: false,
    };
  },
  computed: {
    currentStatus() {
      return this.response ? _.get(this.response, 'status', 'undefined') : null;
    },
    currentErrorMessage() {
      return this.response ? this.response.message : null;
    },
    statusBarVariant() {
      if (this.currentStatus === null || this.currentStatus === 'undefined') return 'secondary';
      if (this.currentStatus.toString().match(/20[0-9]/) != null) return 'success';
      return 'danger';
    },
  },
  watch: {
    response: {
      handler(value) {
        this.$refs[`responseEditorWrapper-${this.tabIdx}`].setContent(
          JSON.stringify(value, null, ' '),
        );
      },
    },
  },
  methods: {
    toggleFullscreen() {
      this.isFullScreen = !this.isFullScreen;
    },
  },
};
</script>

<style lang="scss" scoped>
.responseJsonEditor {
  height: calc(100% - 74px) !important;
}
</style>
