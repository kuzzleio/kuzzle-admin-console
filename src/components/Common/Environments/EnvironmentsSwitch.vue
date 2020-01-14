<template>
  <div>
    <b-dropdown
      :text="currentEnvironmentName"
      ref="dropdown"
      class="EnvironmentsSwitch"
    >
      <b-dropdown-item
        v-for="(env, index) in $store.direct.getters.kuzzle.environments"
        :key="env.name"
        :data-env="`env_${formatForDom(env.name)}`"
        class="EnvironmentsSwitch-env environment"
      >
        <div @click="clickSwitch(index)">
          <div class="EnvironmentsSwitch-env-name">
            {{ env.name }}
            <span class="text-muted ml-2 mr-5">{{ env.host }}</span>
          </div>
          <div class="EnvironmentsSwitch-env-inputs">
            <i
              class="edit primary fa fa-pencil-alt mr-3"
              @click.prevent="$emit('environment::create', index)"
            />
            <i
              class="delete error fa fa-trash"
              @click.prevent="$emit('environment::delete', index)"
            />
          </div>
        </div>
      </b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item>
        <a href="" @click.prevent="$emit('environment::create')">
          Create new connection
        </a>
      </b-dropdown-item>
      <b-dropdown-item>
        <a ref="export">
          Export all
        </a>
      </b-dropdown-item>
      <b-dropdown-item>
        <a href="" @click.prevent="$emit('environment::importEnv')">
          Import
        </a>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import { DEFAULT_COLOR } from '../../../services/environment'
import tinycolor from 'tinycolor2/tinycolor'
import Promise from 'bluebird'

import { formatForDom } from '../../../utils'

export default {
  name: 'EnvironmentsSwitch',
  props: ['blendColor'],
  computed: {
    currentEnvironmentName() {
      if (!this.$store.direct.getters.kuzzle.currentEnvironment) {
        return null
      }

      return this.$store.direct.getters.kuzzle.currentEnvironment.name
    },
    bgColor() {
      if (!this.blendColor) {
        return DEFAULT_COLOR
      }

      let color
      if (!this.$store.direct.getters.kuzzle.currentEnvironment) {
        color = DEFAULT_COLOR
      } else {
        color = this.$store.direct.getters.kuzzle.currentEnvironment.color
      }
      if (!color) {
        color = DEFAULT_COLOR
      }

      return tinycolor(color)
        .lighten(10)
        .toString()
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

    $(this.$refs.dropdown)
      .find('.dropdown-button')
      .dropdown({ constrain_width: false, belowOrigin: true })
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

<style lang="scss" rel="stylesheet/scss" scoped>
.EnvironmentsSwitch-env {
  display: table;

  &-name {
    display: table-cell;
  }

  &-inputs {
    display: table-cell;
  }
}
</style>
