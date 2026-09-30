<template>
  <div class="UsersManagement mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <Headline>Users</Headline>
      <div class="flex flex-wrap items-center gap-2">
        <!--
          `as` bascule sur `button` quand l'action est interdite : un
          `router-link` ignore `disabled` et resterait cliquable (G-016).
        -->
        <Button
          :as="authStore.canCreateUser ? RouterLink : 'button'"
          data-cy="UsersManagement-createBtn"
          :disabled="!authStore.canCreateUser"
          :to="authStore.canCreateUser ? { name: 'SecurityUsersCreate' } : undefined"
          >Create User</Button
        >

        <DropdownMenu>
          <DropdownMenuTrigger
            :as="Button"
            aria-label="Actions on users"
            data-cy="UsersDropdown"
            size="icon"
            variant="outline"
          >
            <i class="fas fa-ellipsis-v" aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              :as="RouterLink"
              data-cy="UsersDropdown-editMapping"
              :to="{ name: 'SecurityUsersEditCustomMapping' }"
            >
              Edit user content mapping
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Not allowed -->
    <ListNotAllowed v-if="!authStore.canSearchUser" />

    <UserList
      v-if="authStore.canSearchUser"
      item-name="UserItem"
      collection="users"
      index="%kuzzle"
      route-create="SecurityUsersCreate"
      route-update="SecurityUsersUpdate"
      :mapping-attributes="mappingAttributes"
    >
      <template #emptySet>
        <Card class="EmptyState">
          <CardContent class="flex flex-col items-center text-center">
            <i class="fas fa-user fa-6x mb-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle class="font-heading text-headline font-extrabold text-muted-foreground"
              >No user is defined</CardTitle
            >
            <CardDescription v-if="authStore.canCreateUser" class="mt-2 text-muted-foreground">
              You can create a new user by hitting the button above
            </CardDescription>
          </CardContent>
        </Card>
      </template>
    </UserList>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { extractAttributesFromMapping } from '@/services/mappingHelpers';
import { useAuthStore, useKuzzleStore } from '@/stores';

import UserList from './List.vue';

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();

const userMapping = ref({});

const mappingAttributes = computed(() => extractAttributesFromMapping(userMapping.value));

onMounted(async () => {
  const wrapper = kuzzleStore.wrapper;
  if (!wrapper) {
    throw new Error('No Kuzzle wrapper set for the current environment');
  }
  const mapping = await wrapper.getMappingUsers();
  userMapping.value = mapping.mapping;
});
</script>
