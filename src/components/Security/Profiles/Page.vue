<template>
  <b-container class="ProfileManagement">
    <b-row>
      <b-col cols="8">
        <headline>Profiles</headline>
      </b-col>
      <b-col class="text-right mt-3">
        <b-button
          class="mr-2"
          data-cy="ProfilesManagement-createBtn"
          variant="primary"
          :disabled="!canCreateProfile"
          :to="{ name: 'SecurityProfilesCreate' }"
          >Create Profile</b-button
        >
      </b-col>
    </b-row>

    <!-- Not allowed -->
    <list-not-allowed v-if="!canSearchProfile" />

    <list
      v-if="canSearchProfile"
      item-name="ProfileItem"
      route-create="SecurityProfilesCreate"
      route-update="SecurityProfilesUpdate"
      @create-clicked="createProfile"
    >
      <b-card slot="emptySet" class="EmptyState text-center">
        <i class="text-secondary fas fa-user fa-6x mb-3" />
        <h2 class="text-secondary font-weight-bold">No profile is defined</h2>
        <p v-if="canCreateProfile" class="text-secondary">
          You can create a new profile by hitting the button above
        </p> </b-card
      >iv>
    </list>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';

import List from './List.vue';

export default {
  name: 'ProfileManagement',
  components: {
    List,
    ListNotAllowed,
    Headline,
  },
  computed: {
    ...mapGetters('auth', ['canSearchProfile', 'canCreateProfile']),
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

<style lang="scss" scoped>
.ProfileManagement {
  margin-bottom: 3em;
}
</style>
