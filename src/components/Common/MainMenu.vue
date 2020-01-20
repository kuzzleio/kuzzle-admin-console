<template>
  <div>
    <b-navbar
      fixed="top"
      toggleable="lg"
      type="dark"
      :class="`EnvColor--${currentEnvironmentColor}`"
    >
      <b-navbar-brand href="#" class="logo">
        <div class="version-container">
          {{ adminConsoleVersion }}
        </div>
        <div>
          <a href="/" class="">
            <img src="~../../assets/logo-white.svg" alt="Kuzzle.io" />
          </a>
        </div>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" type="light"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item :to="{ name: 'Data' }">Data</b-nav-item>
          <b-nav-item v-if="hasSecurityRights()" :to="{ name: 'Security' }">
            Security
          </b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-text class="mr-2 text-white">
            <b>{{ currentUserName }}</b> on
          </b-nav-text>
          <environment-switch
            :blend-color="true"
            style="display: inline-flex"
            @environment::importEnv="importEnv"
            @environment::create="editEnvironment"
            @environment::delete="deleteEnvironment"
          />
          <b-nav-item class="ml-1">
            <a title="Logout" @click="doLogout"
              ><i class="logout fas fa-power-off"
            /></a>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import { hasSecurityRights } from '../../services/userAuthorization'
import { DEFAULT_COLOR } from '../../services/environment'
import EnvironmentSwitch from './Environments/EnvironmentsSwitch'

export default {
  name: 'MainMenu',
  components: {
    EnvironmentSwitch
  },
  computed: {
    currentEnvironmentColor() {
      if (!this.$store.direct.getters.kuzzle.currentEnvironment) {
        return DEFAULT_COLOR
      }

      return this.$store.direct.getters.kuzzle.currentEnvironment.color
    },

    versionColor() {
      return shadeColor2(this.currentEnvironmentColor, 0.5)
    },

    currentUserName() {
      if (this.$store.direct.state.auth.user) {
        if (
          this.$store.direct.state.auth.user.params &&
          this.$store.direct.state.auth.user.params.name
        ) {
          return this.$store.direct.state.auth.user.params.name
        }
        return this.$store.direct.state.auth.user.id
      }
      return ''
    },

    adminConsoleVersion() {
      return require('../../../package.json').version
    }
  },

  methods: {
    doLogout() {
      return this.$store.direct.dispatch.auth.doLogout().then(() => {
        this.$router.push({ name: 'Login' })
      })
    },
    hasSecurityRights,
    editEnvironment(id) {
      this.$emit('environment::create', id)
    },
    importEnv() {
      this.$emit('environment::importEnv')
    },
    deleteEnvironment(id) {
      this.$emit('environment::delete', id)
    }
  }
}

function shadeColor2(color, percent) {
  // https://stackoverflow.com/questions/41173998/is-it-possible-to-use-the-computed-properties-to-compute-another-properties-in-v
  var f, t, p, R, G, B
  f = parseInt(color.slice(1), 16)
  t = percent < 0 ? 0 : 255
  p = percent < 0 ? percent * -1 : percent
  R = f >> 16
  G = (f >> 8) & 0x00ff
  B = f & 0x0000ff
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  )
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
nav {
  padding-right: 20px;

  li.nav {
    font-family: 'Ubuntu', sans-serif;
  }

  li {
    .logout {
      font-size: 1.2em;
      height: 18px;
    }

    &.nav {
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 400;

      &.active,
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
.logo,
.logo a {
  height: 50px;
  padding: 0px;
}

.logo-container {
  position: relative;
}

.version-container {
  position: absolute;
  top: 12px;
  left: 0;
  color: white;
  width: 100%;
  height: 100%;
  padding-right: 5px;
  z-index: -1;
  font-size: 0.8em;
}
.logo img {
  height: 50px;
  padding: 4px 50px 6px 39px;
}
</style>
