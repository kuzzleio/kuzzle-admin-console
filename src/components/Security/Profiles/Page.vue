<template>
  <div class="ProfileManagement mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <Headline>Profiles</Headline>
      <!--
        `as` bascule sur `button` quand l'action est interdite : un
        `router-link` ignore `disabled` et resterait cliquable (G-016).
      -->
      <Button
        :as="authStore.canCreateProfile ? RouterLink : 'button'"
        data-cy="ProfilesManagement-createBtn"
        :disabled="!authStore.canCreateProfile"
        :to="authStore.canCreateProfile ? { name: 'SecurityProfilesCreate' } : undefined"
        >Create Profile</Button
      >
    </div>

    <!-- Not allowed -->
    <ListNotAllowed v-if="!authStore.canSearchProfile" />

    <ProfileList
      v-if="authStore.canSearchProfile"
      item-name="ProfileItem"
      route-create="SecurityProfilesCreate"
      route-update="SecurityProfilesUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';

import ProfileList from './List.vue';

const authStore = useAuthStore();
</script>
