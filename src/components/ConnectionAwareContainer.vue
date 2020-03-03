<template>
  <div class="ConnectionAwareContainer h-100">
    <div
      data-cy="AntiGlitchOverlay"
      class="AntiGlitchOverlay"
      v-if="connecting && !showOfflineSpinner"
    ></div>
    <offline-spinner
      v-if="connecting && showOfflineSpinner"
      data-cy="App-offline"
      @environment::create="$emit('environment::create', $event)"
      @environment::delete="$emit('environment::delete', $event)"
      @environment::importEnv="$emit('environment::importEnv')"
    ></offline-spinner>
    <router-view
      v-else
      data-cy="App-online"
      @environment::create="$emit('environment::create', $event)"
      @environment::delete="$emit('environment::delete', $event)"
      @environment::importEnv="$emit('environment::importEnv')"
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
      showOfflineSpinner: false
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
    },
    connecting: {
      immediate: true,
      handler(val) {
        if (val === false) {
          this.showOfflineSpinner = false
          return
        }
        this.showOfflineSpinner = false
        setTimeout(() => {
          this.showOfflineSpinner = true
        }, 600)
      }
    }
  }
}
</script>

<style>
.AntiGlitchOverlay {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}
</style>
