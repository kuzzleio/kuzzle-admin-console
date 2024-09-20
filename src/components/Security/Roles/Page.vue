<template>
  <b-container class="RolesManagement">
    <b-row>
      <b-col cols="8">
        <headline>Roles</headline>
      </b-col>
      <b-col class="text-right">
        <b-button
          v-b-modal.revokeAnonymous-modal
          :disabled="!displayRevokeAnonymous"
          :title="
            displayRevokeAnonymous
              ? 'Reduce anonymous rights to the minimum'
              : 'You cannot revoke anonymous rights either because you don\'t have the permissions to do it or because there is no administrator user yet in the system.'
          "
          class="mr-2"
          data-cy="RolesManagement-revokeAnonymous"
          variant="primary"
          >Revoke anonymous rights</b-button
        >
        <b-button
          class="mr-2"
          data-cy="RolesManagement-createBtn"
          variant="primary"
          :disabled="!canCreateRole"
          :to="{ name: 'SecurityRolesCreate' }"
          >Create Role</b-button
        >
      </b-col>
    </b-row>

    <list-not-allowed v-if="!canSearchRole" />

    <role-list
      v-if="canSearchRole"
      item-name="RoleItem"
      route-create="SecurityRolesCreate"
      route-update="SecurityRolesUpdate"
    >
      <b-card slot="emptySet" class="EmptyState text-center">
        <i class="text-secondary fas fa-unlock-alt fa-6x mb-3" />
        <h2 class="text-secondary font-weight-bold">No role is defined</h2>
        <p v-if="canCreateRole" class="text-secondary">
          You can create a new role by hitting the button above
        </p>
      </b-card>
    </role-list>
    <b-modal
      id="revokeAnonymous-modal"
      title="Revoke anonymous rights"
      data-cy="revokeAnonymous-modal"
      @ok="revokeAnonymous"
    >
      <p class="my-4">
        The anonymous users will only be able to perform some basic authentication actions, like
        logging-in, see their rights and see their user ID. You will still be able to add more
        rights if needed.
      </p>
    </b-modal>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';
import { KAuthGettersTypes, StoreNamespaceTypes } from '@/store';

import RoleList from './List.vue';

export default {
  name: 'RolesManagement',
  components: {
    ListNotAllowed,
    RoleList,
    Headline,
  },
  methods: {
    async revokeAnonymous() {
      try {
        await this.$kuzzle.security.updateRole(
          'anonymous',
          {
            controllers: {
              '*': {
                actions: {
                  '*': false,
                },
              },
              auth: {
                actions: {
                  checkToken: true,
                  getCurrentUser: true,
                  getMyRights: true,
                  login: true,
                },
              },
              server: {
                actions: {
                  publicApi: true,
                  openapi: true,
                },
              },
            },
          },
          { refresh: 'wait_for' },
        );

        await this.$kuzzle.security.updateRole(
          'default',
          {
            controllers: {
              '*': {
                actions: {
                  '*': false,
                },
              },
              auth: {
                actions: {
                  checkToken: true,
                  getCurrentUser: true,
                  getMyRights: true,
                  logout: true,
                  updateSelf: true,
                },
              },
              server: {
                actions: {
                  publicApi: true,
                },
              },
            },
          },
          { refresh: 'wait_for' },
        );
        this.$router.go(this.$router.currentRoute);
      } catch (err) {
        this.$log.error(err);
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while revoking Anonymous role.',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
      }
    },
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle']),
    ...mapGetters('auth', ['canSearchRole', 'canCreateRole']),
    displayRevokeAnonymous() {
      return (
        this.$store.getters[
          `${StoreNamespaceTypes.AUTH}/${KAuthGettersTypes.ADMIN_ALREADY_EXISTS}`
        ] &&
        this.$store.getters[`${StoreNamespaceTypes.AUTH}/${KAuthGettersTypes.CAN_EDIT_ROLE}`] &&
        this.$store.getters[`${StoreNamespaceTypes.AUTH}/${KAuthGettersTypes.CAN_MANAGE_ROLES}`] &&
        this.$store.getters[`${StoreNamespaceTypes.AUTH}/${KAuthGettersTypes.USER}`].id !== -1
      );
    },
  },
};
</script>
