<template>
  <div class="RolesManagement tw:mx-auto tw:w-full tw:max-w-6xl tw:px-4 tw:pb-12">
    <div class="tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-4">
      <headline>Roles</headline>
      <div class="tw:flex tw:flex-wrap tw:gap-2">
        <Button
          data-cy="RolesManagement-revokeAnonymous"
          :disabled="!displayRevokeAnonymous"
          :title="
            displayRevokeAnonymous
              ? 'Reduce anonymous rights to the minimum'
              : 'You cannot revoke anonymous rights either because you don\'t have the permissions to do it or because there is no administrator user yet in the system.'
          "
          @click="revokeAnonymousOpen = true"
          >Revoke anonymous rights</Button
        >
        <!--
          `as` bascule sur `button` quand l'action est interdite : un
          `router-link` ignore `disabled` et resterait cliquable (G-016).
        -->
        <Button
          :as="canCreateRole ? 'router-link' : 'button'"
          data-cy="RolesManagement-createBtn"
          :disabled="!canCreateRole"
          :to="canCreateRole ? { name: 'SecurityRolesCreate' } : undefined"
          >Create Role</Button
        >
      </div>
    </div>

    <list-not-allowed v-if="!canSearchRole" />

    <role-list
      v-if="canSearchRole"
      item-name="RoleItem"
      route-create="SecurityRolesCreate"
      route-update="SecurityRolesUpdate"
    >
      <template #emptySet>
        <Card class="EmptyState">
          <CardContent class="tw:flex tw:flex-col tw:items-center tw:text-center">
            <i class="fas fa-unlock-alt fa-6x tw:mb-4 tw:text-secondary" aria-hidden="true" />
            <CardTitle class="tw:text-secondary">No role is defined</CardTitle>
            <CardDescription v-if="canCreateRole" class="tw:mt-2 tw:text-secondary">
              You can create a new role by hitting the button above
            </CardDescription>
          </CardContent>
        </Card>
      </template>
    </role-list>

    <Dialog :open="revokeAnonymousOpen" @update:open="revokeAnonymousOpen = $event">
      <DialogContent data-cy="revokeAnonymous-modal" labelled-by="revoke-anonymous-title">
        <DialogHeader>
          <DialogTitle id="revoke-anonymous-title">Revoke anonymous rights</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          The anonymous users will only be able to perform some basic authentication actions, like
          logging-in, see their rights and see their user ID. You will still be able to add more
          rights if needed.
        </DialogDescription>

        <DialogFooter>
          <Button variant="outline" @click="revokeAnonymousOpen = false">Cancel</Button>
          <Button @click="confirmRevokeAnonymous">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore, useKuzzleStore } from '@/stores';

import RoleList from './List.vue';

export default {
  name: 'RolesManagement',
  components: {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    ListNotAllowed,
    RoleList,
    Headline,
  },
  setup() {
    return {
      authStore: useAuthStore(),
    };
  },
  data() {
    return {
      revokeAnonymousOpen: false,
    };
  },
  methods: {
    async confirmRevokeAnonymous() {
      this.revokeAnonymousOpen = false;
      await this.revokeAnonymous();
    },
    async revokeAnonymous() {
      try {
        await this.$kuzzle.query({
          controller: 'security',
          action: 'restrictDefaultRights',
        });
        this.$router.go(this.$router.currentRoute);
      } catch (err) {
        if (err.status === 404) {
          this.$bvToast.toast(
            'This action is not supported by your Kuzzle version. You might need to upgrade.',
            {
              title: 'Not supported!',
              variant: 'warning',
              toaster: 'b-toaster-bottom-right',
              appendToast: true,
            },
          );
        } else {
          this.$log.error(err);
          this.$bvToast.toast('The complete error has been printed to the console.', {
            title: 'Ooops! Something went wrong while revoking Anonymous role.',
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
          });
        }
      }
    },
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
    ...mapState(useAuthStore, ['canSearchRole', 'canCreateRole']),
    displayRevokeAnonymous() {
      return (
        this.authStore.adminAlreadyExists &&
        this.authStore.canEditRole &&
        this.authStore.canManageRoles &&
        this.authStore.user?.id !== -1
      );
    },
  },
};
</script>
