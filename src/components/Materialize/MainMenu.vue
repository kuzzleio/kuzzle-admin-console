<template>
  <header>
    <div class="navbar-fixed">
      <nav>
        <a href="#" class="brand-logo">
          <img src="../../assets/logo-white-horizontal.png" alt="Kuzzle.io" />
        </a>
        <div class="container">
          <ul>
            <li v-link-active>
              <a v-link="{name: 'Data', activeClass: 'active'}">Data</a>
            </li>
            <li v-link-active>
              <a v-link="{name: 'Security', activeClass: 'active'}">Security</a>
            </li>
          </ul>

          <ul id="nav-mobile" class="right hide-on-med-and-down">
            <li>
              Howdy <strong>{{user.id}}</strong>!
            </li>
            <li>
              <a @click="doLogout">Logout</a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
  import {user} from '../../vuex/modules/auth/getters'
  import {doLogout} from '../../vuex/modules/auth/actions'

  export default {
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
.brand-logo {
  height: 100%;
}

.brand-logo img {
  height: 100%;
  padding: 10px;
}
</style>
