<template>
  <div class="UsersManagement mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <headline>Users</headline>
      <div class="flex flex-wrap items-center gap-2">
        <!--
          `as` bascule sur `button` quand l'action est interdite : un
          `router-link` ignore `disabled` et resterait cliquable (G-016).
        -->
        <Button
          :as="canCreateUser ? 'router-link' : 'button'"
          data-cy="UsersManagement-createBtn"
          :disabled="!canCreateUser"
          :to="canCreateUser ? { name: 'SecurityUsersCreate' } : undefined"
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
              as="router-link"
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
      <template #emptySet>
        <Card class="EmptyState">
          <CardContent class="flex flex-col items-center text-center">
            <i class="fas fa-user fa-6x mb-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle class="font-heading text-headline font-extrabold text-muted-foreground"
              >No user is defined</CardTitle
            >
            <CardDescription v-if="canCreateUser" class="mt-2 text-muted-foreground">
              You can create a new user by hitting the button above
            </CardDescription>
          </CardContent>
        </Card>
      </template>
    </list>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import { mapState } from 'pinia';

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

import List from './List.vue';

export default {
  name: 'UsersManagement',
  components: {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Headline,
    List,
    ListNotAllowed,
  },
  data() {
    return {
      /*
       * `DropdownMenuTrigger` prend le composant lui-même en prop `as`, pas
       * son nom : c'est l'API de l'amont, et `Button` doit donc être une
       * valeur lisible depuis le template. `markRaw` et non `Object.freeze` :
       * Vue met en cache le constructeur sur les options du composant, et un
       * objet gelé le lui interdit (G-032).
       */
      Button: markRaw(Button),
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
