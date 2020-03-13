<template>
  <div class="SecurityLayout">
    <div class="SecurityLayout-sidebarWrapper">
      <b-nav vertical>
        <b-nav-item
          v-if="canManageUsers()"
          :to="{ name: 'SecurityUsersList' }"
          active
        >
          <b-row no-gutters>
            <b-col cols="2">
              <i class="fa fa-user fa-lg align-bottom" aria-hidden="true" />
            </b-col>
            <b-col cols="10" class="sideEntry">
              Users
            </b-col>
          </b-row>
        </b-nav-item>
        <b-nav-item
          v-if="canManageProfiles()"
          :to="{ name: 'SecurityProfilesList' }"
        >
          <b-row no-gutters>
            <b-col cols="2">
              <i class="fa fa-users fa-lg align-bottom" aria-hidden="true" />
            </b-col>
            <b-col cols="10" class="sideEntry">
              Profiles
            </b-col>
          </b-row>
        </b-nav-item>
        <b-nav-item v-if="canManageRoles()" :to="{ name: 'SecurityRolesList' }">
          <b-row no-gutters>
            <b-col cols="2">
              <i
                class="fa fa-unlock-alt fa-lg align-bottom"
                aria-hidden="true"
              />
            </b-col>
            <b-col cols="10" class="sideEntry">
              Roles
            </b-col>
          </b-row>
        </b-nav-item>
      </b-nav>
    </div>
    <div class="SecurityLayout-contentWrapper">
      <router-view />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.sideEntry {
  font-size: 22px;
}

.SecurityLayout {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
.SecurityLayout-sidebarWrapper {
  background-color: $light-grey-color;
  flex-basis: $sidebar-width;
  min-width: $sidebar-width;
  height: 100%;
  overflow: auto;
  box-shadow: 0px 0px 5px 0px rgba(112, 112, 112, 1);
  z-index: 1;
}

.SecurityLayout-contentWrapper {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: $content-gutter;
}
</style>

<script>
import {
  canManageUsers,
  canManageRoles,
  canManageProfiles
} from '../../services/userAuthorization'

export default {
  name: 'SecurityLayout',
  watch: {
    $route(v) {
      this.fetchMapping(v)
    }
  },
  mounted() {
    this.fetchMapping(this.$route)
  },
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
          this.$store.direct.dispatch.security.fetchUserMapping()
          break
        case 'profiles':
          this.$store.direct.dispatch.security.fetchProfileMapping()
          break
        case 'roles':
          this.$store.direct.dispatch.security.fetchRoleMapping()
          break
      }
    }
  }
}
</script>
