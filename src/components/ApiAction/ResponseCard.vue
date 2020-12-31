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
              <p class="mb-0">Status: {{ currentStatus }}</p>
              <b-card-text v-if="currentErrorMessage">
                {{ currentErrorMessage }}
              </b-card-text>
            </b-alert>
          </b-col>
        </b-row>
        <json-editor
          id="response"
          ref="responseEditorWrapper"
          reference="responseEditor"
          tabindex="4"
          :height="250"
          readonly
          content="{}"
        />
      </b-card-body>
      <b-card-footer class="text-right">
        <!-- <b-button
          @click="copyToClipBoard('Response')"
          variant="outline-secondary"
        >
          <i class="fas fa-copy mr-2" />
          COPY
        </b-button> -->
      </b-card-footer>
    </b-card>
</template>

<script>
import jsonEditor from '@/components/Common/JsonEditor'

export default {
  components: {
    jsonEditor,
  },
  props: {
   response: {
     default: ""
   }
  },
  watch: {
    response: {
      handler(value) {
        this.$refs.responseEditorWrapper.setContent(JSON.stringify(value, null, ' '))
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
    // copyToClipBoard() {}
  }
}
</script>

<style></style>
