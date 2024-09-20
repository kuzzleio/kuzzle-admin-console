<template>
  <b-dropdown
    ref="dropdown"
    class="EnvironmentSwitch"
    data-cy="EnvironmentSwitch"
    toggle-class="text-truncate"
    variant="outline-secondary"
    :block="block"
    :right="right"
    :class="blendColor ? 'EnvironmentSwitch--blendColor' : ''"
  >
    <template v-slot:button-content>
      <template v-if="currentEnvironment">
        <i
          v-if="!isValidEnvironment(currentEnvironment)"
          class="fas fa-exclamation-triangle text-danger"
        ></i
        >&nbsp;{{ currentEnvironment.name }}
      </template>
      <template v-else>
        Select a connection
      </template>
    </template>
    <b-dropdown-item
      v-for="(env, index) in sortObject(
        $store.direct.getters.kuzzle.environments
      )"
      class="EnvironmentSwitch-env environment"
      :key="env.name"
      :data-cy="`EnvironmentSwitch-env_${formatForDom(env.name)}`"
    >
      <div
        @click="
          isValidEnvironment(env)
            ? switchEnv(index)
            : $emit('environment::create', index)
        "
        class="EnvironmentSwitch-env-name text-truncate mr-3"
      >
        {{ env.name }}
        <i
          v-if="!isValidEnvironment(env)"
          class="fas fa-exclamation-triangle text-danger"
        ></i>
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
    <b-dropdown-item
      data-cy="export-environments"
      download="connections.json"
      :href="exportUrl"
    >
      Export all
    </b-dropdown-item>
    <b-dropdown-item @click.prevent="$emit('environment::importEnv')">
      Import
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { mapValues, omit } from 'lodash'
import { mapGetters } from 'vuex'

import { formatForDom, sortObject } from '@/utils'
import { isValidEnvironment } from '@/validators'

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
    ...mapGetters('kuzzle', ['currentEnvironment']),
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
  methods: {
    isValidEnvironment,
    async switchEnv(id) {
      try {
        await this.$store.direct.dispatch.kuzzle.setCurrentEnvironment(id)
        this.$emit('environmentSwitched')
      } catch (error) {
        this.$log.error(error)
        if (error.code) {
          this.$store.direct.dispatch.kuzzle.onConnectionError(error)
        }
      }
    },
    sortObject,
    formatForDom
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.dropdown-menu {
  max-height: 98vh;
  overflow-x: auto;
}
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
