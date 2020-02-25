<template>
  <div class="ConnectionAwareContainer h-100">
    <offline-spinner v-if="connecting"></offline-spinner>
    <router-view
      v-else
      @environment::create="$emit('environment::create')"
      @environment::delete="$emit('environment::delete', $event)"
    ></router-view>

    <b-toast
      id="offline-toast"
      title="Offline"
      no-auto-hide
      no-close-button
      variant="warning"
      toaster="b-toaster-top-center"
      append="true"
    >
      It looks like your Kuzzle instance is currently unreachable
    </b-toast>
  </div>
</template>

<script>
import OfflineSpinner from './Common/Offline'
export default {
  name: 'ConnectionAwareContainer',
  components: {
    OfflineSpinner
  },
  data() {
    return {
      showOfflineSpinner: true
    }
  },
  computed: {
    online() {
      return this.$store.direct.state.kuzzle.online
    },
    connecting() {
      return this.$store.direct.state.kuzzle.connecting
    }
  },
  methods: {
    checkConnection() {
      if (this.online === false && this.connecting === false) {
        this.$bvToast.show('offline-toast')
      } else {
        this.$bvToast.hide('offline-toast')
      }
    }
  },
  async mounted() {
    this.$kuzzle.on('networkError', error => {
      this.$store.direct.commit.kuzzle.setErrorFromKuzzle(error.message)
    })
    this.$kuzzle.addListener('connected', () => {
      this.$store.direct.commit.kuzzle.setOnline(true)
    })
    this.$kuzzle.addListener('reconnected', () => {
      this.$store.direct.commit.kuzzle.setOnline(true)
    })
    this.$kuzzle.addListener('disconnected', () => {
      this.$store.direct.commit.kuzzle.setOnline(false)
    })

    this.$store.direct.commit.auth.setTokenValid(false)
    this.$store.direct.dispatch.kuzzle.connectToCurrentEnvironment()
  },
  watch: {
    online: {
      immediate: true,
      handler() {
        this.checkConnection()
      }
    }
  }
}
</script>

<style></style>
