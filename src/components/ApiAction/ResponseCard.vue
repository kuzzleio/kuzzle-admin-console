<template>
  <b-card no-body class="h-100">
    <b-card-header>
      <b-card-title> Response </b-card-title>
    </b-card-header>
    <b-card-body class="p-0">
      <b-row class="m-2" no-gutters>
        <b-col cols="12">
          <b-alert show :variant="statusBarVariant" class="mb-0">
            <p class="mb-0" :data-cy="`api-actions-response-status-${tabIdx}`">
              Status: {{ currentStatus }}
            </p>
            <b-card-text v-if="currentErrorMessage">
              {{ currentErrorMessage }}
            </b-card-text>
          </b-alert>
        </b-col>
      </b-row>
      <json-editor
        :id="`responseEditorWrapper-${tabIdx}`"
        :ref="`responseEditorWrapper-${tabIdx}`"
        :data-cy="`api-actions-response-JSONEditor-${tabIdx}`"
        readonly
        class="m-2 responseJsonEditor"
        content="{}"
      />
    </b-card-body>
  </b-card>
</template>

<script>
import _ from 'lodash';

import jsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  components: {
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
