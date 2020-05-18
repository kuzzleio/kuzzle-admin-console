<template>
  <div class="ConnectionAwareContainer h-100">
    <template v-if="connecting">
      <div
        data-cy="AntiGlitchOverlay"
        class="AntiGlitchOverlay"
        v-if="!showOfflineSpinner"
      ></div>
      <offline-spinner
        v-if="showOfflineSpinner"
        data-cy="App-offline"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      ></offline-spinner>
    </template>
    <template v-else>
      <error-page
        v-if="kuzzleError"
        data-cy="App-connectionError"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
      <router-view
        v-else
        data-cy="App-online"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      ></router-view>
    </template>
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
import ErrorPage from './Error/KuzzleErrorPage'
import OfflineSpinner from './Common/Offline'
import { antiGlitchOverlayTimeout } from '../utils'

export default {
  name: 'ConnectionAwareContainer',
  components: {
    OfflineSpinner,
    ErrorPage
  },
  data() {
    return {
      showOfflineSpinner: false,
      gaveUp: false
    }
  },
  computed: {
    currentEnvironment() {
      return this.$store.state.kuzzle.currentId
    },
    kuzzleError() {
      return this.$store.state.kuzzle.errorFromKuzzle
    },
    online() {
      return this.$store.direct.state.kuzzle.online
    },
    connecting() {
      return this.$store.direct.state.kuzzle.connecting
    }
  },
  methods: {
    initListeners() {
      this.$kuzzle.on('networkError', error => {
        this.$log.error(error)
        if (error.code) {
          this.$store.direct.dispatch.kuzzle.onConnectionError(error)
        }
      })
      this.$kuzzle.addListener('connected', async () => {
        this.$store.direct.commit.kuzzle.setConnecting(false)
        this.$store.direct.commit.kuzzle.setOnline(true)
        this.$log.debug(
          'ConnectionAwareContainer::initializing auth upon connection...'
        )
        await this.$store.direct.dispatch.auth.init()
        this.authenticationGuard()
      })
      this.$kuzzle.addListener('reconnected', () => {
        this.$store.direct.commit.kuzzle.setConnecting(false)
        this.$store.direct.commit.kuzzle.setOnline(true)
        this.$log.debug(
          'ConnectionAwareContainer::checking authentication after reconnection...'
        )
        this.authenticationGuard()
      })
      this.$kuzzle.addListener('disconnected', () => {
        this.$log.debug('ConnectionAwareContainer::backend went offline...')
        this.$store.direct.commit.kuzzle.setOnline(false)
      })
    },
    removeListeners() {
      this.$kuzzle.removeAllListeners('networkError')
      this.$kuzzle.removeAllListeners('connected')
      this.$kuzzle.removeAllListeners('reconnected')
      this.$kuzzle.removeAllListeners('disconnected')
    },
    giveUp() {
      this.removeListeners()
      this.gaveUp = true
      this.$store.direct.commit.kuzzle.setConnecting(false)
      this.$store.direct.commit.kuzzle.setOnline(false)
    },
    checkConnection() {
      if (this.online === false && this.connecting === false) {
        this.$bvToast.show('offline-toast')
      } else {
        this.$bvToast.hide('offline-toast')
      }
    },
    async connect() {
      try {
        await this.$store.direct.dispatch.kuzzle.connectToCurrentEnvironment()
      } catch (error) {
        this.$log.error(error)
        if (error.code) {
          this.$store.direct.dispatch.kuzzle.onConnectionError(error)
        }
      }
    },
    async onEnvironmentSwitch() {
      this.$log.debug('ConnectionAwareContainer::environmentSwitched')
      this.$store.direct.commit.auth.setTokenValid(false)
      this.removeListeners()
      this.initListeners()
      await this.connect()
    },
    async authenticationGuard() {
      this.$log.debug('ConnectionAwareContainer::authentication guard')
      if (!this.$store.direct.getters.auth.isAuthenticated) {
        this.$log.debug('ConnectionAwareContainer::not authenticated')
        this.$router.push({ name: 'Login', query: { to: this.$route.name } })
      }
    }
  },
  beforeDestroy() {
    this.removeListeners()
  },
  watch: {
    currentEnvironment: {
      immediate: true,
      async handler() {
        await this.onEnvironmentSwitch()
      }
    },
    online: {
      immediate: true,
      handler() {
        this.checkConnection()
      }
    },
    connecting: {
      immediate: true,
      handler(val) {
        this.showOfflineSpinner = val
        setTimeout(() => {
          this.showOfflineSpinner = true
        }, antiGlitchOverlayTimeout)
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
