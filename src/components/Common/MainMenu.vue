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

          <ul id="nav-mobile" class="right">
            <li>
              Howdy <strong>{{user.id}}</strong>!
            </li>
            <li>
              <a @click="doLogout">Logout</a>
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

  export default {
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
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 400;
    }
  }
}
.logo {
}

.logo img {
  height: 53px;
  padding: 10px 48px 10px 0;
}
</style>
