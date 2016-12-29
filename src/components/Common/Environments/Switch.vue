<template>
  <span ref="dropdown">
    <a class="btn-flat dropdown-button current-environment grey-text text-lighten-5 waves-effect waves-light" :style="{ backgroundColor: bgColor }"
       data-activates='environment-dropdown'>
        <span v-if="$store.getters.currentEnvironment" class="current-environment-name truncate">
          {{currentEnvironmentName}}
        </span>
        <span v-if="!$store.getters.currentEnvironment" class="current-environment-name truncate">
          Choose Environment
        </span>
        <i class="fa fa-caret-down"></i>
    </a>

    <ul id='environment-dropdown' class='dropdown-content'>
      <li v-for="(env, index) in $store.state.kuzzle.environments" class="environment">
        <div @click="clickSwitch(index)">
          <span class="name environment-attribute truncate">{{env.name}}</span>
          <span class="host environment-attribute">{{env.host}}</span>
        </div>
        <i class="edit primary fa fa-pencil" @click.prevent="$emit('environment::create', index)"></i>
        <i class="delete error fa fa-trash" @click.prevent="$emit('environment::delete', index)"></i>
      </li>
      <li class="divider"></li>
      <li><a href="" @click.prevent="$emit('environment::create')"><i class="fa fa-plus-circle"></i> Create new</a></li>
    </ul>
  </span>
</template>

<script>
  import { DEFAULT_COLOR } from '../../../services/environment'
  import { SWITH_ENVIRONMENT } from '../../../vuex/modules/common/kuzzle/mutation-types'
  import tinycolor from 'tinycolor2/tinycolor'
  import Promise from 'bluebird'

  export default {
    name: 'EnvironmentsSwitch',
    props: [
      'blendColor'
    ],
    computed: {
      currentEnvironmentName () {
        if (!this.$store.getters.currentEnvironment) {
          return null
        }

        return this.$store.getters.currentEnvironment.name
      },
      bgColor () {
        if (!this.blendColor) {
          return DEFAULT_COLOR
        }

        let color
        if (!this.$store.getters.currentEnvironment) {
          color = DEFAULT_COLOR
        } else {
          color = this.$store.getters.currentEnvironment.color
        }
        if (!color) {
          color = DEFAULT_COLOR
        }

        return tinycolor(color).lighten(10).toString()
      }
    },
    methods: {
      clickSwitch (id) {
        return this.$store.dispatch(SWITH_ENVIRONMENT, id)
          .then(() => {
            /* Ugly hack in order to force Vue to refresh and pass in router.beforeEach and let check if user is auth */
            this.$router.push({path: '/fake-route'})
            setTimeout(() => {
              this.$router.push({path: '/'})
              return Promise.resolve()
            }, 0)
          })
          .catch((e) => {
            this.$emit('toast', 'An error occurred while switching environment', 'error')
            return Promise.reject(e)
          })
      }
    },
    mounted () {
      $(this.$refs.dropdown).find('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true})
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .current-environment {
    background-color: #002835;
    transition: .25s ease;
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

  #environment-dropdown {
    top: 50px;
    width: 280px;
    .environment {
      position: relative;
      border-bottom: 1px solid #eaeaea;

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
          color: #2A2A2A;
          padding: 0 0 10px 14px;
        }
      }
    }
    .edit {
      position: absolute;
      top: 25px;
      right: 35px;
      font-size: 1.2em;
    }
    .delete {
      position: absolute;
      top: 25px;
      right: 10px;
      padding: 0;
      margin: 0;
      font-size: 1.2em;
    }
  }
</style>
