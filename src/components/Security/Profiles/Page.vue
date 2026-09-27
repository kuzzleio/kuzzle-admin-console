<template>
  <div class="ProfileManagement mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <headline>Profiles</headline>
      <!--
        `as` bascule sur `button` quand l'action est interdite : un
        `router-link` ignore `disabled` et resterait cliquable (G-016).
      -->
      <Button
        :as="canCreateProfile ? 'router-link' : 'button'"
        data-cy="ProfilesManagement-createBtn"
        :disabled="!canCreateProfile"
        :to="canCreateProfile ? { name: 'SecurityProfilesCreate' } : undefined"
        >Create Profile</Button
      >
    </div>

    <!-- Not allowed -->
    <list-not-allowed v-if="!canSearchProfile" />

    <list
      v-if="canSearchProfile"
      item-name="ProfileItem"
      route-create="SecurityProfilesCreate"
      route-update="SecurityProfilesUpdate"
      @create-clicked="createProfile"
    >
      <template #emptySet>
        <Card class="EmptyState">
          <CardContent class="flex flex-col items-center text-center">
            <i class="fas fa-user fa-6x mb-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle class="font-heading text-headline font-extrabold text-muted-foreground"
              >No profile is defined</CardTitle
            >
            <CardDescription v-if="canCreateProfile" class="mt-2 text-muted-foreground">
              You can create a new profile by hitting the button above
            </CardDescription>
          </CardContent>
        </Card>
      </template>
    </list>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores';

import List from './List.vue';

export default {
  name: 'ProfileManagement',
  components: {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardTitle,
    List,
    ListNotAllowed,
    Headline,
  },
  computed: {
    ...mapState(useAuthStore, ['canSearchProfile', 'canCreateProfile']),
  },
  methods: {
    createProfile() {
      this.$router.push({ name: 'SecurityProfilesCreate' });
    },
  },
  route: {
    data() {
      this.$emit('crudl-refresh-search');
    },
  },
};
</script>
