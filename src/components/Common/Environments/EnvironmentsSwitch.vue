<template>
  <b-dropdown
    ref="dropdown"
    class="EnvironmentSwitch"
    data-cy="EnvironmentSwitch"
    toggle-class="text-truncate"
    variant="outline-secondary"
    :text="dropdownText"
    :block="block"
    :right="right"
    :class="blendColor ? 'EnvironmentSwitch--blendColor' : ''"
  >
    <b-dropdown-item
      v-for="(env, index) in $store.direct.getters.kuzzle.environments"
      class="EnvironmentSwitch-env environment"
      :key="env.name"
      :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}`"
    >
      <div
        @click="clickSwitch(index)"
        class="EnvironmentSwitch-env-name text-truncate mr-3"
      >
        {{ env.name }}
        <div class="text-muted">{{ env.host }}</div>
      </div>
      <div class="EnvironmentSwitch-env-inputs">
        <i
          class="edit primary fa fa-pencil-alt mr-3"
          :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}-edit`"
          @click.prevent="$emit('environment::create', index)"
        />
        <i
          class="delete error fa fa-trash"
          :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}-delete`"
          @click.prevent="$emit('environment::delete', index)"
        />
      </div>
    </b-dropdown-item>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item @click.prevent="$emit('environment::create')">
      <a data-cy="EnvironmentSwitch-newConnectionBtn" href="">
        Create new connection
      </a>
    </b-dropdown-item>
    <b-dropdown-item download="connections.json" :href="exportUrl">
      Export all
    </b-dropdown-item>
    <b-dropdown-item @click.prevent="$emit('environment::importEnv')">
      Import
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { formatForDom } from '../../../utils'
import { mapValues, omit } from 'lodash'

export default {
  name: 'EnvironmentSwitch',
  props: {
    blendColor: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: true
    },
    right: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    currentEnvironment() {
      return this.$store.direct.getters.kuzzle.currentEnvironment
    },
    dropdownText() {
      if (!this.currentEnvironment) {
        return 'Select a connection'
      }

      return this.currentEnvironment.name
    },
    exportUrl() {
      const envWitoutToken = mapValues(
        this.$store.state.kuzzle.environments,
        e => omit(e, 'token')
      )

      const blob = new Blob([JSON.stringify(envWitoutToken)], {
        type: 'application/json'
      })

      return URL.createObjectURL(blob)
    }
  },
  mounted() {},
  methods: {
    async clickSwitch(id) {
      try {
        this.$log.debug(`Switching to environment ${id}...`)
        await this.$store.direct.dispatch.kuzzle.switchEnvironment(id)
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title: 'Ooops! Something went wrong while switching connections.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
        return
      }
      try {
        this.$log.debug(`Switched.`)
        if (this.$store.direct.state.auth.tokenValid) {
          this.$log.debug(`Token is valid, going to /...`)
          this.$router.push({ path: '/' })
        } else {
          this.$log.debug(`Token is invalid, going to Login...`)
          this.$router.push({ name: 'Login' })
        }
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while authenticating to the new environment.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    },
    formatForDom
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.EnvironmentSwitch--blendColor,
.EnvironmentSwitch--blendColor.show {
  .dropdown-toggle {
    background-color: rgba(255, 255, 255, 0.4) !important;
    border: none;
    color: white;

    &:hover {
      background-color: rgba(255, 255, 255, 0.6) !important;
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.6) !important;
    }

    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5) !important;
    }
  }
}

.EnvironmentSwitch-env {
  a {
    display: flex;
    align-items: center;
  }

  .EnvironmentSwitch-env-name {
    flex: 1;
    max-width: 250px;
  }
}
</style>
