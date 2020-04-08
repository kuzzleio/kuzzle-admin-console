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
          :disabled="!canCreateProfile()"
          :to="{ name: 'SecurityProfilesCreate' }"
          >Create Profile</b-button
        >
      </b-col>
    </b-row>

    <!-- Not allowed -->
    <list-not-allowed v-if="!canSearchProfile()" />

    <list
      v-if="canSearchProfile()"
      item-name="ProfileItem"
      :display-create="canCreateProfile()"
      :perform-search="performSearchProfiles"
      :perform-delete="performDeleteProfiles"
      route-create="SecurityProfilesCreate"
      route-update="SecurityProfilesUpdate"
      @create-clicked="createProfile"
    >
      <b-card class="EmptyState text-center" slot="emptySet">
        <i class="text-secondary fas fa-user fa-6x mb-3"></i>
        <h2 class="text-secondary font-weight-bold">
          No profile is defined
        </h2>
        <p class="text-secondary" v-if="canCreateProfile()">
          You can create a new profile by hitting the button above
        </p> </b-card
      >iv>
    </list>
  </b-container>
</template>

<script>
import List from './List'
import ListNotAllowed from '../../Common/ListNotAllowed'
import Headline from '../../Materialize/Headline'
import {
  canSearchProfile,
  canCreateProfile
} from '../../../services/userAuthorization'
import {
  performSearchProfiles,
  performDeleteProfiles
} from '../../../services/kuzzleWrapper'

export default {
  name: 'ProfileManagement',
  components: {
    List,
    ListNotAllowed,
    Headline
  },
  methods: {
    createProfile() {
      this.$router.push({ name: 'SecurityProfilesCreate' })
    },
    canSearchProfile,
    canCreateProfile,
    performSearchProfiles,
    performDeleteProfiles
  },
  route: {
    data() {
      this.$emit('crudl-refresh-search')
    }
  }
}
</script>

<style lang="scss" scoped>
.ProfileManagement {
  margin-bottom: 3em;
}
</style>
