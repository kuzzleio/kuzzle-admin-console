<template>
  <div>
    <aside>
      <ul class="Treeview-container sidenav fixed leftside-navigation ps-container ps-active-y">
        <router-link v-if="canManageUsers()" class="bold" tag="li" :to="{name: 'SecurityUsersList'}" active-class="active">
          <a class="waves-effect">
            <i class="fa fa-user" aria-hidden="true"></i>
            <span>Users</span>
          </a>
        </router-link>
        <router-link v-if="canManageProfiles()" class="bold" tag="li" :to="{name: 'SecurityProfilesList'}" active-class="active">
          <a class="waves-effect">
            <i class="fa fa-users" aria-hidden="true"></i>
            <span>Profiles</span>
          </a>
        </router-link>
        <router-link v-if="canManageRoles()" class="bold" tag="li" :to="{name: 'SecurityRolesList'}" active-class="active">
          <a class="waves-effect">
            <i class="fa fa-unlock-alt" aria-hidden="true"></i>
            <span>Roles</span>
          </a>
        </router-link>
      </ul>
    </aside>

    <section class="view">
      <div class="wrapper">
        <router-view></router-view>
      </div>
    </section>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.Treeview-container {
  @media (max-width: $medium-screen) {
    // @HACK this is nasty, but we need it to override the default
    // MaterializeCSS behavior, hiding the side menu whenever the
    // screen is less than medium-width.
    transform: translateX(0);
  }
}
.sidenav {
  top: 50px;
  width: $sidebar-width;
  a {
    i.fa {
      color: #646464;
    }
    height: 54px;
    line-height: 54px;
  }
  transform: translateX(0%) !important;
}
aside {
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  a {
    padding: 0 20px;
  }
  .fa {
    width: 18px;
  }
}

</style>

<script>
import * as types from '../../vuex/modules/security/mutation-types'
import {
  canManageUsers,
  canManageRoles,
  canManageProfiles
} from '../../services/userAuthorization'

export default {
  name: 'SecurityLayout',
  methods: {
    canManageUsers,
    canManageRoles,
    canManageProfiles,
    fetchMapping(v) {
      if (!v.meta) {
        return
      }
      switch (v.meta.section) {
        case 'users':
          this.$store.dispatch(types.FETCH_USER_MAPPING)
          break
        case 'profiles':
          this.$store.dispatch(types.FETCH_PROFILE_MAPPING)
          break
        case 'roles':
          this.$store.dispatch(types.FETCH_ROLE_MAPPING)
          break
      }
    }
  },
  mounted() {
    this.fetchMapping(this.$route)
  },
  watch: {
    $route(v) {
      this.fetchMapping(v)
    }
  }
}
</script>
