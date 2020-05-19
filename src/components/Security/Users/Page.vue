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
            data-cy="UsersManagement-createBtn"
            variant="primary"
            :disabled="!canCreateUser"
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
            <b-dropdown-item
              data-cy="UsersDropdown-editMapping"
              :to="{ name: 'SecurityUsersEditCustomMapping' }"
            >
              Edit user content mapping
            </b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>

      <!-- Not allowed -->
      <list-not-allowed v-if="!canSearchUser" />

      <list
        v-if="canSearchUser"
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
        <b-card class="EmptyState text-center" slot="emptySet">
          <i class="text-secondary fas fa-user fa-6x mb-3"></i>
          <h2 class="text-secondary font-weight-bold">
            No user is defined
          </h2>
          <p class="text-secondary" v-if="canCreateUser">
            You can create a new user by hitting the button above
          </p>
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
  performSearchUsers,
  performDeleteUsers,
  getMappingUsers
} from '../../../services/kuzzleWrapper'
import { mapGetters } from 'vuex'
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
  computed: {
    ...mapGetters('auth', ['canSearchUser', 'canCreateUser'])
  },
  methods: {
    createUser() {
      this.$router.push({ name: 'SecurityUsersCreate' })
    },
    performSearchUsers,
    performDeleteUsers
  }
}
</script>

<style lang="scss" scoped>
.UserManagement {
  margin-bottom: 3em;
}
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
