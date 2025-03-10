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
            id="users-dropdown"
            data-cy="UsersDropdown"
            no-caret
            toggle-class="usersDropdown"
            variant="light"
          >
            <template #button-content>
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
        :mapping-attributes="mappingAttributes"
      >
        <b-card slot="emptySet" class="EmptyState text-center">
          <i class="text-secondary fas fa-user fa-6x mb-3" />
          <h2 class="text-secondary font-weight-bold">No user is defined</h2>
          <p v-if="canCreateUser" class="text-secondary">
            You can create a new user by hitting the button above
          </p>
        </b-card>
      </list>
    </b-container>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';
import { extractAttributesFromMapping } from '@/services/mappingHelpers';
import { useAuthStore, useKuzzleStore } from '@/stores';

import List from './List.vue';

export default {
  name: 'UsersManagement',
  components: {
    ListNotAllowed,
    List,
    Headline,
  },
  data() {
    return {
      userMapping: {},
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
    ...mapState(useAuthStore, ['canSearchUser', 'canCreateUser']),
    mappingAttributes() {
      return this.extractAttributesFromMapping(this.userMapping);
    },
  },
  async mounted() {
    const mapping = await this.wrapper.getMappingUsers();
    this.userMapping = mapping.mapping;
  },
  methods: {
    extractAttributesFromMapping,
    createUser() {
      this.$router.push({ name: 'SecurityUsersCreate' });
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss';

.UserManagement {
  margin-bottom: 3em;
}
::v-deep .usersDropdown {
  background-color: variables.$light-grey-color;
  border: none;
}
.UserList--container {
  transition: max-width 0.6s;
}

::v-deep .show .usersDropdown i {
  transform: rotate(90deg);
}
</style>
