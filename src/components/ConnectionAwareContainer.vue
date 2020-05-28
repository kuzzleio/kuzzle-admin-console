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
import OfflineSpinner from './Common/Offline'
import ErrorPage from './Error/KuzzleErrorPage'
import { antiGlitchOverlayTimeout } from '../utils'
import { mapGetters } from 'vuex'

export default {
  name: 'ConnectionAwareContainer',
  components: {
    ErrorPage,
    OfflineSpinner
  },
  data() {
    return {
      showOfflineSpinner: false
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle']),
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
      if (!this.$kuzzle) {
        return
      }
      this.$kuzzle.on('networkError', error => {
        this.$log.error(
          `ConnectionAwareContainer:kuzzle.on('networkError'): ${error.message}`
        )
      })
      this.$kuzzle.addListener('connected', async () => {
        this.$store.direct.commit.kuzzle.setConnecting(false)
        this.$store.direct.commit.kuzzle.setOnline(true)
        this.$log.debug(
          'ConnectionAwareContainer::initializing auth upon connection...'
        )
        try {
          await this.$store.direct.dispatch.auth.init()
        } catch (error) {
          this.$log.error(
            `ConnectionAwareContainer:initializing auth: "${error.message}" - code: ${error.code} - id: ${error.id}`
          )
          if (error.id === 'api.process.incompatible_sdk_version') {
            return this.$store.direct.dispatch.kuzzle.onConnectionError(error)
          }
        }
        this.authenticationGuard()
      })
      this.$kuzzle.addListener('reconnected', () => {
        this.$store.direct.commit.kuzzle.setConnecting(false)
        this.$store.direct.commit.kuzzle.setOnline(true)
        this.$log.debug(
          'ConnectionAwareContainer::checking token after reconnection...'
        )
        this.$store.direct.dispatch.auth.checkToken()
      })
      this.$kuzzle.addListener('disconnected', () => {
        this.$log.debug('ConnectionAwareContainer::backend went offline...')
        this.$store.direct.commit.kuzzle.setOnline(false)
      })
    },
    removeListeners() {
      if (!this.$kuzzle) {
        return
      }
      this.$kuzzle.removeAllListeners('networkError')
      this.$kuzzle.removeAllListeners('connected')
      this.$kuzzle.removeAllListeners('reconnected')
      this.$kuzzle.removeAllListeners('disconnected')
    },
    checkConnection() {
      if (this.online === false && this.connecting === false) {
        this.$bvToast.show('offline-toast')
      } else {
        this.$bvToast.hide('offline-toast')
      }
    },
    async onEnvironmentSwitch() {
      this.$log.debug('ConnectionAwareContainer::environmentSwitched')
      this.$store.direct.commit.auth.setTokenValid(false)
      this.removeListeners()
      this.initListeners()
      try {
        await this.$store.direct.dispatch.kuzzle.connectToCurrentEnvironment()
      } catch (error) {
        this.$log.error(
          `ConnectionAwareContainer:onEnvironmentSwitch: ${error.message}`
        )
      }
    },
    async authenticationGuard() {
      this.$log.debug('ConnectionAwareContainer::authentication guard')
      if (this.$route.meta.skipLogin) {
        return
      }
      if (
        this.$route.matched.some(record => record.meta.requiresAuth) &&
        !this.$store.direct.getters.auth.isAuthenticated
      ) {
        this.$log.debug('ConnectionAwareContainer::not authenticated')
        this.$router.push({ name: 'Login', query: { to: this.$route.name } })
      }
    }
  },
  beforeDestroy() {
    this.removeListeners()
  },
  watch: {
    $kuzzle: {
      immediate: true,
      handler(instance) {
        if (!instance) {
          return
        }
        this.removeListeners()
        this.initListeners()
      }
    },
    currentEnvironment: {
      immediate: true,
      async handler() {
        try {
          await this.onEnvironmentSwitch()
        } catch (error) {
          this.$log.error(
            `ConnectionAwareContainer:currentEnvironmentWatch: ${error.message}`
          )
        }
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
