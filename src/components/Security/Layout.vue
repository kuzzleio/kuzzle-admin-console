<template>
  <div class="SecurityLayout">
    <div class="SecurityLayout-sidebarWrapper">
      <b-nav vertical>
        <b-nav-item
          v-if="canManageUsers"
          :to="{ name: 'SecurityUsersList' }"
          :class="
            $route.path.includes('users')
              ? 'activeItemClass'
              : 'inactiveItemClass'
          "
        >
          <b-row no-gutters>
            <b-col cols="2">
              <i class="fa fa-user fa-lg align-middle" aria-hidden="true" />
            </b-col>
            <b-col cols="10" class="sideEntry pl-2 pt-1">
              Users
            </b-col>
          </b-row>
        </b-nav-item>
        <b-nav-item
          v-if="canManageProfiles"
          :to="{ name: 'SecurityProfilesList' }"
          :class="
            $route.path.includes('profiles')
              ? 'activeItemClass'
              : 'inactiveItemClass'
          "
        >
          <b-row no-gutters>
            <b-col cols="2">
              <i class="fa fa-id-badge fa-lg align-middle" aria-hidden="true" />
            </b-col>
            <b-col cols="10" class="sideEntry pl-2 pt-1">
              Profiles
            </b-col>
          </b-row>
        </b-nav-item>
        <b-nav-item
          v-if="canManageRoles"
          :to="{ name: 'SecurityRolesList' }"
          :class="
            $route.path.includes('roles')
              ? 'activeItemClass'
              : 'inactiveItemClass'
          "
        >
          <b-row no-gutters>
            <b-col cols="2">
              <i
                class="fa fa-unlock-alt fa-lg align-middle"
                aria-hidden="true"
              />
            </b-col>
            <b-col cols="10" class="sideEntry pl-2 pt-1">
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
@use '@/assets/styles/variables.scss';

.activeItemClass {
  font-weight: 600;
  opacity: 1;
}

.inactiveItemClass {
  font-weight: 100;
  opacity: 0.6;
}

.SecurityLayout {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
.SecurityLayout-sidebarWrapper {
  padding-top: 1em;
  background-color: variables.$light-grey-color;
  flex-basis: variables.$sidebar-width;
  min-width: variables.$sidebar-width;
  height: 100%;
  overflow: auto;
  box-shadow: 0px 0px 5px 0px rgba(112, 112, 112, 1);
  z-index: 1;
}

.SecurityLayout-contentWrapper {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: variables.$content-gutter;
}
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SecurityLayout',
  computed: {
    ...mapGetters('auth', [
      'canManageUsers',
      'canManageRoles',
      'canManageProfiles'
    ])
  }
}
</script>
