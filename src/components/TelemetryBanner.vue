<template>
  <div class="Main">
    <b-toast
      id="discarded-toast"
      title="Request Discarded"
      no-auto-hide
      no-close-button
      variant="danger"
      toaster="b-toaster-bottom-right"
      append="true"
    >
      Your request could not be sent to Kuzzle. Check the browser console for
      more details.
    </b-toast>
    <b-toast
      id="kepler-banner"
      title="Usage telemetry"
      no-auto-hide
      no-close-button
      variant="info"
      toaster="b-toaster-bottom-right"
      :visible="isBannerVisible"
    >
      <div align="justify">
        We use an Open Source analytics to study the use of our products in
        order to improve them. We do not collect any personal data.
      </div>
      <div align="center" class="mt-2 pa-1">
        <b-button
          class="mr-1"
          variant="outline-danger"
          size="sm"
          @click="disableTelemetry"
        >
          Disable telemetry
        </b-button>
        <b-button
          class="ml-1"
          variant="success"
          size="sm"
          @click="enableTelemetry"
        >
          Accept
        </b-button>
      </div>
    </b-toast>
  </div>
</template>

<script>
import telemetryCookies from '../services/telemetryCookies'

export default {
  name: 'TelemtryBanner',
  computed: {
    isBannerVisible() {
      return telemetryCookies.get() === null ? true : false
    }
  },
  methods: {
    enableTelemetry() {
      telemetryCookies.set('true', 30)
      this.$bvToast.hide('kepler-banner')
    },
    disableTelemetry() {
      telemetryCookies.set('false', 1)
      this.$bvToast.hide('kepler-banner')
    }
  }
}
</script>
