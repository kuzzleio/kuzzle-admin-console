<template>
  <div class="ProfileManagement tw:mx-auto tw:w-full tw:max-w-6xl tw:px-4 tw:pb-12">
    <div class="tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-4">
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
          <CardContent class="tw:flex tw:flex-col tw:items-center tw:text-center">
            <i class="fas fa-user fa-6x tw:mb-4 tw:text-secondary" aria-hidden="true" />
            <CardTitle class="tw:text-secondary">No profile is defined</CardTitle>
            <CardDescription v-if="canCreateProfile" class="tw:mt-2 tw:text-secondary">
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
