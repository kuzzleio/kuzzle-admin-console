<template>
  <header>
    <div class="navbar-fixed">
      <nav>
        <a href="#" class="brand-logo">Logo</a>
        <div class="container">
          <ul>
            <li><a>Dashboard</a></li>
            <li v-link-active>
              <a v-link="{name: 'Data', activeClass: 'active'}">Data</a>
            </li>
            <li v-link-active>
              <a v-link="{name: 'Security', activeClass: 'active'}">Security</a>
            </li>
          </ul>

          <ul id="nav-mobile" class="right hide-on-med-and-down">
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
  import {doLogout} from '../../vuex/modules/auth/actions'

  export default {
    vuex: {
      actions: {
        doLogout
      }
    }
  }
</script>