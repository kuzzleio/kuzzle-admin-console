<template>
  <header>
    <div class="navbar-fixed">
      <nav :style="{backgroundColor: currentEnvironmentColor}">
        <ul>
          <li class="logo">
            <a href="#" class="">
              <img src="../../assets/logo-white.svg" alt="Kuzzle.io" />
            </a>
          </li>
          <router-link tag="li" class="nav" :to="{name: 'Data'}" active-class="active">
            <a>Data</a>
          </router-link>
          <router-link v-if="hasSecurityRights()" tag="li" class="nav" :to="{name: 'Security'}" active-class="active">
            <a>Security</a>
          </router-link>
        </ul>

        <ul class="right">
          <li>
            Welcome <strong>{{$store.getters.user}}</strong>
          </li>
          <li>
            <environment-switch blend-color="true" style="display: inline-flex" @environment::create="editEnvironment"></environment-switch>
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
  import {DO_LOGOUT} from '../../vuex/modules/auth/mutation-types'
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
      doLogout () {
        this.$store.dispatch(DO_LOGOUT)
        this.$router.push({name: 'Login'})
      },
      hasSecurityRights,
      editEnvironment (id) {
        this.$emit('environment::create', id)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
nav {
  padding-right: 20px;

  li {
    font-family: "Gobold", Arial, sans-serif;

    .logout {
      font-size: 1.2em;
      height: 18px;
    }
    &.nav {
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 400;

      &.active, &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
.logo, .logo a {
  height: 50px;
}

.logo img {
  height: 50px;
  padding: 4px 50px 6px 39px;
}
</style>
