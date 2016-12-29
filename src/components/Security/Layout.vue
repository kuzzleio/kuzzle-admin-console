<template>
  <div>
    <aside>
      <ul class="side-nav fixed leftside-navigation ps-container ps-active-y">
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
  .side-nav {
    a {
      i.fa {
        color: #646464
      }
      height: 54px;
      line-height: 54px;
    }
  }
  aside {
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    a {
      padding: 0 20px;
    }
    .fa {
      width: 18px;
    }
  }
</style>

<script>
  import { canManageUsers, canManageRoles, canManageProfiles } from '../../services/userAuthorization'

  export default {
    name: 'SecurityLayout',
    methods: {
      canManageUsers,
      canManageRoles,
      canManageProfiles
    }
  }
</script>
