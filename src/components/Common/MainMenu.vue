<template>
  <header>
    <div class="navbar-fixed">
      <nav>
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
            <a @click="doLogout">Logout</a>
          </li>

          <environments-switch @main-menu::create-env="$broadcast('modal-open', 'create-env')"></environments-switch>
        </ul>
      </nav>

      <modal-create></modal-create>
    </div>
  </header>
</template>

<script>
  import {hasSecurityRights} from '../../services/userAuthorization'
  import {user} from '../../vuex/modules/auth/getters'
  import {doLogout} from '../../vuex/modules/auth/actions'
  import EnvironmentsSwitch from './Environments/Switch'
  import ModalCreate from './Environments/ModalCreate'

  export default {
    components: {
      EnvironmentsSwitch,
      ModalCreate
    },
    methods: {
      hasSecurityRights
    },
    vuex: {
      getters: {
        user
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
    font-weight: 500;

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
