<template>
  <header>
    <div class="navbar-fixed">
      <nav :style="{backgroundColor: currentEnvironmentColor}">
        <ul>
          <li class="logo">
            <a href="#" class="">
              <img src="../../assets/logo-white-horizontal.png" alt="Kuzzle.io" />
            </a>
          </li>
          <li class="nav" v-link-active>
            <a v-link="{name: 'Data', activeClass: 'active'}">Data</a>
          </li>
          <li class="nav" v-link-active v-if="hasSecurityRights()">
            <a v-link="{name: 'Security', activeClass: 'active'}">Security</a>
          </li>
        </ul>

        <ul class="right">
          <li>
            Welcome <strong>{{user.id}}</strong>
          </li>
          <li>
            <environment-switch></environment-switch>
          </li>
          <li>
            <a @click="doLogout"><i class="logout fa fa-power-off"></i></a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
  import {hasSecurityRights} from '../../services/userAuthorization'
  import {user} from '../../vuex/modules/auth/getters'
  import {doLogout} from '../../vuex/modules/auth/actions'
  import { currentEnvironment } from '../../vuex/modules/common/kuzzle/getters'
  import {DEFAULT_COLOR} from '../../services/environment'
  import EnvironmentSwitch from './Environments/Switch'

  export default {
    components: {
      EnvironmentSwitch
    },
    computed: {
      currentEnvironmentColor () {
        if (!this.currentEnvironment) {
          return DEFAULT_COLOR
        }

        return this.currentEnvironment.color
      }
    },
    methods: {
      hasSecurityRights
    },
    vuex: {
      getters: {
        user,
        currentEnvironment
      },
      actions: {
        doLogout
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
header {
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}
nav {
  padding-right: 20px;
  li {
    font-family: "Roboto", Arial, sans-serif;

    .logout {
      font-size: 1.2em;
      height: 18px;
    }
    &.nav {
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 400;
    }
  }
}
.logo {
}

.logo img {
  height: 50px;
  padding: 10px 63px 10px 0;
}
</style>
