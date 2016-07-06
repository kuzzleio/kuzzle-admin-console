<template>
  <header>
    <nav>
      <div class="navbar-fixed">
        <a href="#" class="brand-logo">Logo</a>
        <div class="container">
          <ul>
            <li><a>Dashboard</a></li>
            <li><a>Data</a></li>
            <li v-link-active>
              <a v-link="{name: 'Security', activeClass: 'active'}">Security</a>
            </li>
          </ul>

          <button @click="doLogout">Logout</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
  import { doLogout } from '../../vuex/modules/auth/actions'

  export default {
    vuex: {
      actions: {
        doLogout
      }
    }
  }
</script>