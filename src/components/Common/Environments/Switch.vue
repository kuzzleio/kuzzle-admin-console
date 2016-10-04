<template>
  <span>
    <li>
      <a class="btn-flat dropdown-button current-environment right grey-text secondary text-lighten-5 waves-effect waves-light"
         data-activates='environment-dropdown'>
          <span class="current-environment-name truncate">
            {{currentEnvironment.name}}
          </span>

          <i class="fa fa-caret-down"></i>
      </a>
    </li>

    <ul id='environment-dropdown' class='dropdown-content'>
      <li v-for="(id, env) in environments" class="environment">
        <div @click="switchEnvironment(id)">
          <span class="name environment-attribute truncate">{{env.name}}</span>
          <span class="host environment-attribute">{{env.host}}</span>
        </div>
        <i class="edit primary fa fa-pencil" @click.prevent="$dispatch('environment::create', id)"></i>
        <i class="delete error fa fa-trash" @click.prevent="$dispatch('environment::delete', id)"></i>
      </li>
      <li class="divider"></li>
      <li><a href="" @click.prevent="$dispatch('environment::create')"><i class="fa fa-plus-circle"></i> Create new</a></li>
    </ul>
  </span>
</template>

<script>
  import { environments, currentEnvironment } from '../../../vuex/modules/common/kuzzle/getters'
  import { switchEnvironment } from '../../../services/environment'
  import ModalCreate from './ModalCreate'

  export default {
    name: 'EnvironmentsSwitch',
    components: {
      ModalCreate
    },
    vuex: {
      getters: {
        environments,
        currentEnvironment
      }
    },
    methods: {
      switchEnvironment (id) {
        switchEnvironment(id)
          .catch((e) => {
            this.$dispatch('toast', 'An error occurred while switching environment', 'error')
          })
      }
    },
    ready () {
      /* eslint no-undef: 0 */
      $(this.$el).find('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true})
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .current-environment {
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
          color: #00757F;
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
      right: 5px;
      font-size: 1.2em;
    }
  }
</style>
