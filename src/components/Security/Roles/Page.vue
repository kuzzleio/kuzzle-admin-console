<template>
  <div class="RolesManagement mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <headline>Roles</headline>
      <div class="flex flex-wrap gap-2">
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
          <CardContent class="flex flex-col items-center text-center">
            <i class="fas fa-unlock-alt fa-6x mb-4 text-secondary" aria-hidden="true" />
            <CardTitle class="text-secondary">No role is defined</CardTitle>
            <CardDescription v-if="canCreateRole" class="mt-2 text-secondary">
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
          this.$toast.warning(
            'Not supported!',
            'This action is not supported by your Kuzzle version. You might need to upgrade.',
          );
        } else {
          this.$log.error(err);
          this.$toast.danger(
            'Ooops! Something went wrong while revoking Anonymous role.',
            'The complete error has been printed to the console.',
          );
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
