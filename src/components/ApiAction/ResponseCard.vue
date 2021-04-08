<template>
  <b-card no-body class="h-100">
    <b-card-header>
      <b-card-title>
        Response
      </b-card-title>
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
        :ref="`responseEditorWrapper-${tabIdx}`"
        :id="`responseEditorWrapper-${tabIdx}`"
        :data-cy="`api-actions-response-JSONEditor-${tabIdx}`"
        readonly
        class="m-2 responseJsonEditor"
        :content="content"
      />
    </b-card-body>
  </b-card>
</template>

<script>
import jsonEditor from '@/components/Common/JsonEditor'

export default {
  components: {
    jsonEditor
  },
  props: {
    response: {
      default: ''
    },
    tabIdx: {}
  },
  data() {
    return {
      isFullScreen: false,
      content: '{}'
    }
  },
  watch: {
    response: {
      handler(value) {
        this.content = JSON.stringify(value, null, ' ')
      }
    }
  },
  computed: {
    currentStatus() {
      return this.response ? this.response.status : null
    },
    currentErrorMessage() {
      return this.response ? this.response.message : null
    },
    statusBarVariant() {
      if (this.currentStatus === null) return 'secondary'
      if (this.currentStatus.toString().match(/20[0-9]/)) return 'success'
      return 'danger'
    }
  },
  methods: {
    toggleFullscreen() {
      this.isFullScreen = !this.isFullScreen
    }
  }
}
</script>

<style lang="scss" scoped>
.responseJsonEditor {
  height: calc(100% - 74px) !important;
}
</style>
