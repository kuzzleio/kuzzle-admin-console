<template>
  <header>
    <div class="navbar-fixed">
      <nav>
        <a href="#" class="brand-logo">
          <img src="../../assets/logo-white-horizontal.png" alt="Kuzzle.io" />
        </a>
        <ul>
            <li v-link-active>
              <a v-link="{name: 'Data', activeClass: 'active'}">Data</a>
            </li>
            <li v-link-active v-if="hasSecurityRights()">
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

<style scoped>
header {
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}
nav {
  padding-right: 20px;
}
.brand-logo {
  height: 100%;
  left: 45%;
  right: 55%;
}

.brand-logo img {
  height: 100%;
  padding: 10px;
}
</style>
