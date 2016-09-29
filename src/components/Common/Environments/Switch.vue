<template>
  <span>
    <li>
      <a class="btn-flat dropdown-button environment right grey-text secondary text-lighten-5 waves-effect waves-light"
         data-activates='environment-dropdown'>
          <span class="current-environment-name truncate">
            {{currentEnvironment.name}}
          </span>

          <i class="fa fa-caret-down"></i>
      </a>
    </li>

    <ul id='environment-dropdown' class='dropdown-content'>
      <li v-for="(id, env) in environments">
        <span class="name">{{env.name}}</span>
        <span class="host">{{env.host}}</span>
        <i class="edit fa fa-pencil" @click="removeEnvironment(id)"></i>
      </li>
      <li class="divider"></li>
      <li><a href="" @click.prevent="$dispatch('main-menu::create-env')"><i class="fa fa-plus-circle"></i> Create new</a></li>
    </ul>
  </span>
</template>

<script>
  import { environments, currentEnvironment } from '../../../vuex/modules/common/kuzzle/getters'
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
      editEnvironment (id) {
        console.log(id)
      }
    },
    ready () {
      /* eslint no-undef: 0 */
      $(this.$el).find('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true})
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .environment {
    transition: .25s ease;
    margin-top: 5px;
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
    width: 250px;

    .edit {
      position: absolute;
      top: 25px;
      right: 10px;
      font-size: 1.2em;
    }
    .name {
      padding: 14px 14px 0 14px
    }
    .host {
      font-size: 0.8em;
      color: #2A2A2A;
      padding: 0 0 10px 14px;
    }
  }
</style>