<template>
  <div class="UsersManagement">
    <b-container class="UserList--container">
      <b-row>
        <b-col cols="8">
          <headline>Users</headline>
        </b-col>
        <b-col class="text-right mt-3">
          <b-button
            class="mr-2"
            variant="primary"
            :disabled="!canCreateUser()"
            :to="{ name: 'SecurityUsersCreate' }"
            >Create User</b-button
          >
          <b-dropdown
            data-cy="UsersDropdown"
            no-caret
            toggle-class="usersDropdown"
            variant="light"
            id="users-dropdown"
          >
            <template v-slot:button-content>
              <i class="fas fa-ellipsis-v" />
            </template>
            <b-dropdown-item :to="{ name: 'SecurityUsersEditCustomMapping' }">
              Edit user content mapping
            </b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>

      <!-- Not allowed -->
      <list-not-allowed v-if="!canSearchUser()" />

      <list
        v-if="canSearchUser()"
        item-name="UserItem"
        collection="users"
        index="%kuzzle"
        route-create="SecurityUsersCreate"
        route-update="SecurityUsersUpdate"
        :display-create="false"
        :perform-search="performSearchUsers"
        :perform-delete="performDeleteUsers"
        :collection-mapping="userMapping"
      >
        <b-card slot="emptySet">
          <b-row class="empty-set">
            <b-col cols="4">
              <i
                class="fa fa-6x fa-user grey-text text-lighten-1 ml-5"
                aria-hidden="true"
              />
            </b-col>
            <b-col>
              <p>
                In this page, you'll be able to manage the
                <a
                  href="https://docs.kuzzle.io/guide/1/essentials/user-authentication/"
                  >users</a
                >
                defined in your Kuzzle server.<br />
                <em
                  >Currently, no user is defined. You can create one by pushing
                  the "Create" button above.</em
                >
              </p>
              <router-link
                :disabled="!canCreateUser()"
                :class="!canCreateUser() ? 'disabled' : ''"
                :title="
                  !canCreateUser()
                    ? 'You are not allowed to create new users'
                    : ''
                "
                :to="{ name: 'SecurityUsersCreate' }"
                class="btn primary waves-effect waves-light"
              >
                <i class="fa fa-plus-circle left" />
                Create a user
              </router-link>
            </b-col>
          </b-row>
        </b-card>
      </list>
    </b-container>
  </div>
</template>

<script>
import List from './List'
import ListNotAllowed from '../../Common/ListNotAllowed'
import Headline from '../../Materialize/Headline'
import {
  canSearchUser,
  canCreateUser
} from '../../../services/userAuthorization'
import {
  performSearchUsers,
  performDeleteUsers,
  getMappingUsers
} from '../../../services/kuzzleWrapper'

export default {
  name: 'UsersManagement',
  components: {
    ListNotAllowed,
    List,
    Headline
  },
  data() {
    return {
      userMapping: {}
    }
  },
  async mounted() {
    const mapping = await getMappingUsers()
    this.userMapping = mapping.mapping
  },
  methods: {
    createUser() {
      this.$router.push({ name: 'SecurityUsersCreate' })
    },
    canSearchUser,
    canCreateUser,
    performSearchUsers,
    performDeleteUsers
  }
}
</script>

<style lang="scss" scoped>
::v-deep .usersDropdown {
  background-color: $light-grey-color;
  border: none;
}
.UserList--container {
  transition: max-width 0.6s;
}

::v-deep .show .usersDropdown i {
  transform: rotate(90deg);
}
</style>
