<template>
  <div>
    <b-dropdown class="dropdownSelector">
      <template v-slot:button-content>
        <span
          v-if="$store.direct.getters.kuzzle.currentEnvironment"
          class="current-environment-name truncate"
        >
          {{ currentEnvironmentName }}
        </span>
        <span
          v-if="!$store.direct.getters.kuzzle.currentEnvironment"
          class="current-environment-name truncate"
        >
          Choose Environment
        </span>
      </template>
      <b-dropdown-item
        v-for="(env, index) in $store.direct.getters.kuzzle.environments"
        :key="env.name"
        :data-env="`env_${formatForDom(env.name)}`"
      >
        <div @click="clickSwitch(index)">
          <span class="name environment-attribute truncate">{{
            env.name
          }}</span>
          <span class="host environment-attribute truncate">{{
            env.host
          }}</span>
        </div>
        <i
          class="edit primary fa fa-pencil-alt"
          @click.prevent="$emit('environment::create', index)"
        />
        <i
          class="delete error fa fa-trash"
          @click.prevent="$emit('environment::delete', index)"
        />
      </b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item>
        <a href="" @click.prevent="$emit('environment::create')"
          ><i class="EnvironmentsSwitch-newConnectionBtn fa fa-plus-circle" />
          Create new connection</a
        >
      </b-dropdown-item>
      <b-dropdown-item>
        <a ref="export"
          ><i class="EnvironmentsSwitch-export-all fa fa-file-export" />Export
          all</a
        >
      </b-dropdown-item>
      <b-dropdown-item>
        <a href="#" @click.prevent="$emit('environment::importEnv')"
          ><i class="fa fa-file-import" />Import</a
        >
      </b-dropdown-item>
    </b-dropdown>
    <!-- <span ref="dropdown" class="EnvironmentsSwitch">
      <a
        class="btn-flat dropdown-button current-environment grey-text text-lighten-5 waves-effect waves-light"
        :style="{ backgroundColor: bgColor }"
        :data-target="'environment-dropdown-' + _uid"
      >
        <span
          v-if="$store.direct.getters.kuzzle.currentEnvironment"
          class="current-environment-name truncate"
        >
          {{ currentEnvironmentName }}
        </span>
        <span
          v-if="!$store.direct.getters.kuzzle.currentEnvironment"
          class="current-environment-name truncate"
        >
          Choose Environment
        </span>
        <i class="fa fa-caret-down" />
      </a>

      <ul
        :id="'environment-dropdown-' + _uid"
        class="EnvironmentsSwitch-envList dropdown-content environment-dropdown"
      > -->
    <!-- <li
          v-for="(env, index) in $store.direct.getters.kuzzle.environments"
          :key="env.name"
          :data-env="`env_${formatForDom(env.name)}`"
          class="EnvironmentsSwitch-env environment"
        >
          <div @click="clickSwitch(index)">
            <span class="name environment-attribute truncate">{{
              env.name
            }}</span>
            <span class="host environment-attribute truncate">{{
              env.host
            }}</span>
          </div>
          <i
            class="edit primary fa fa-pencil-alt"
            @click.prevent="$emit('environment::create', index)"
          />
          <i
            class="delete error fa fa-trash"
            @click.prevent="$emit('environment::delete', index)"
          />
        </li> -->
    <!-- <li class="divider" />
        <li>
          <a href="" @click.prevent="$emit('environment::create')"
            ><i class="EnvironmentsSwitch-newConnectionBtn fa fa-plus-circle" />
            Create new connection</a
          >
        </li>
        <li>
          <a ref="export"
            ><i class="EnvironmentsSwitch-export-all fa fa-file-export" />Export
            all</a
          >
        </li>
        <li>
          <a href="#" @click.prevent="$emit('environment::importEnv')"
            ><i class="fa fa-file-import" />Import</a
          >
        </li> -->
    <!-- </ul> -->
    <!-- </span> -->
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

<style lang="scss" rel="stylesheet/scss">
.dropdownSelector {
  .dropdown-toggle {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
}
.current-environment {
  background-color: #002835;
  transition: 0.25s ease;
  margin-top: 7px;
  .truncate {
    display: inline-block;
  }
  .current-environment-name {
    width: 150px;
  }
  i {
    position: absolute;
    top: 0;
    right: 7px;
  }
}

.environment-dropdown {
  width: 280px;
  .environment {
    position: relative;
    border-bottom: 1px solid #eaeaea;
    line-height: 1.2rem;

    .environment-attribute {
      display: block;
      width: 80%;
      &.name {
        color: #002835;
        padding: 14px 14px 0 14px;
        font-size: 1.2em;
      }
      &.host {
        font-size: 0.8em;
        color: #2a2a2a;
        padding: 0 0 10px 14px;
      }
    }
  }
  .edit {
    position: absolute;
    top: 20px;
    right: 35px;
    font-size: 1em;
  }
  .delete {
    position: absolute;
    top: 20px;
    right: 10px;
    padding: 0;
    margin: 0;
    font-size: 1em;
  }
}
</style>
