<template>
  <div class="UsersManagement">
    <b-container class="UserList--container">
      <headline>
        User Management
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
            Edit data mapping
          </b-dropdown-item>
        </b-dropdown>
      </headline>

      <!-- Not allowed -->
      <list-not-allowed v-if="!canSearchUser()" />

      <common-list
        v-if="canSearchUser()"
        item-name="UserItem"
        collection="users"
        index="%kuzzle"
        route-create="SecurityUsersCreate"
        route-update="SecurityUsersUpdate"
        :display-create="canCreateUser()"
        :perform-search="performSearchUsers"
        :perform-delete="performDeleteUsers"
        :collection-mapping="userMapping"
        @create-clicked="createUser"
      >
        <div slot="emptySet" class="card-panel">
          <div class="row valign-bottom empty-set">
            <div class="col s1 offset-s1">
              <i
                class="fa fa-6x fa-user grey-text text-lighten-1"
                aria-hidden="true"
              />
            </div>
            <div class="col s10">
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
            </div>
          </div>
        </div>
      </common-list>
    </b-container>
  </div>
</template>

<script>
import CommonList from './CommonList'
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
    CommonList,
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
