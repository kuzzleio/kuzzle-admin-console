<template>
  <b-dropdown
    ref="dropdown"
    class="EnvironmentSwitch"
    data-cy="EnvironmentSwitch"
    toggle-class="text-truncate"
    variant="outline-secondary"
    :text="currentEnvironmentName"
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
    <b-dropdown-item>
      <a ref="export">
        Export all
      </a>
    </b-dropdown-item>
    <b-dropdown-item @click.prevent="$emit('environment::importEnv')">
      <a href="">
        Import
      </a>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import Promise from 'bluebird'

import { formatForDom } from '../../../utils'

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
    currentEnvironmentName() {
      if (!this.$store.direct.getters.kuzzle.currentEnvironment) {
        return null
      }

      return this.$store.direct.getters.kuzzle.currentEnvironment.name
    }
  },
  mounted() {
    const env = {}
    for (const name in this.$store.state.kuzzle.environments) {
      env[name] = Object.assign(
        {},
        this.$store.direct.getters.kuzzle.environments[name]
      )
      delete env[name].token
    }

    const blob = new Blob([JSON.stringify(env)], { type: 'application/json' })

    this.$refs.export.href = URL.createObjectURL(blob)
    this.$refs.export.download = 'connections.json'
  },
  methods: {
    clickSwitch(id) {
      return this.$store.direct.dispatch.kuzzle
        .switchEnvironment(id)
        .then(() => {
          this.$router.push({ path: '/' }).catch(() => {})
        })
        .catch(e => {
          this.$store.direct.commit.toaster(
            'An error occurred while switching environment'
          )
          return Promise.reject(e)
        })
    },
    formatForDom
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.EnvironmentSwitch--blendColor {
  .dropdown-toggle {
    background-color: rgba(255, 255, 255, 0.4);
    border: none;
    color: white;
  }

  &.show {
    .dropdown-toggle {
      background-color: rgba(255, 255, 255, 0.4);
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
