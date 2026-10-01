<template>
  <div class="RolesManagement mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <Headline>Roles</Headline>
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
          :as="authStore.canCreateRole ? RouterLink : 'button'"
          data-cy="RolesManagement-createBtn"
          :disabled="!authStore.canCreateRole"
          :to="authStore.canCreateRole ? { name: 'SecurityRolesCreate' } : undefined"
          >Create Role</Button
        >
      </div>
    </div>

    <ListNotAllowed v-if="!authStore.canSearchRole" />

    <RoleList
      v-if="authStore.canSearchRole"
      item-name="RoleItem"
      route-create="SecurityRolesCreate"
      route-update="SecurityRolesUpdate"
    >
      <template #emptySet>
        <Card class="EmptyState">
          <CardContent class="flex flex-col items-center text-center">
            <i class="fas fa-unlock-alt fa-6x mb-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle class="font-heading text-headline font-extrabold text-muted-foreground"
              >No role is defined</CardTitle
            >
            <CardDescription v-if="authStore.canCreateRole" class="mt-2 text-muted-foreground">
              You can create a new role by hitting the button above
            </CardDescription>
          </CardContent>
        </Card>
      </template>
    </RoleList>

    <Dialog :open="revokeAnonymousOpen" @update:open="revokeAnonymousOpen = $event">
      <DialogContent data-cy="revokeAnonymous-modal">
        <DialogHeader>
          <DialogTitle>Revoke anonymous rights</DialogTitle>
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

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

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
import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';

import RoleList from './List.vue';

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const router = useRouter();
const toast = useToast();

const revokeAnonymousOpen = ref(false);

const displayRevokeAnonymous = computed(
  () =>
    authStore.adminAlreadyExists &&
    authStore.canEditRole &&
    authStore.canManageRoles &&
    authStore.user?.id !== -1,
);

async function revokeAnonymous(): Promise<void> {
  try {
    const kuzzle = kuzzleStore.$kuzzle;
    if (!kuzzle) {
      throw new Error('No Kuzzle SDK for the current environment');
    }
    await kuzzle.query({
      controller: 'security',
      action: 'restrictDefaultRights',
    });
    // `go()` prend un nombre : la route qu'il recevait valait 0, soit un
    // rechargement, qui relit les droits. C'est ce qu'il faut ici.
    router.go(0);
  } catch (err) {
    if (caught(err).status === 404) {
      toast.warning(
        'Not supported!',
        'This action is not supported by your Kuzzle version. You might need to upgrade.',
      );
    } else {
      logger.error(err);
      toast.danger(
        'Ooops! Something went wrong while revoking Anonymous role.',
        'The complete error has been printed to the console.',
      );
    }
  }
}

async function confirmRevokeAnonymous(): Promise<void> {
  revokeAnonymousOpen.value = false;
  await revokeAnonymous();
}
</script>
