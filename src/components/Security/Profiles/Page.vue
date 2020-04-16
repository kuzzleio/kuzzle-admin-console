<template>
  <div class="ProfileManagement">
    <headline title="Profile Management" />

    <!-- Not allowed -->
    <list-not-allowed v-if="!canSearchProfile()" />

    <common-list
      v-if="canSearchProfile()"
      item-name="ProfileItem"
      :display-create="canCreateProfile()"
      :perform-search="performSearchProfiles"
      :perform-delete="performDeleteProfiles"
      route-create="SecurityProfilesCreate"
      route-update="SecurityProfilesUpdate"
      @create-clicked="createProfile"
    >
      <div slot="emptySet" class="card-panel">
        <div class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i
              class="fa fa-6x fa-users grey-text text-lighten-1"
              aria-hidden="true"
            />
          </div>
          <div class="col s10">
            <p>
              In this page, you'll be able to manage the
              <a
                href="https://docs.kuzzle.io/core/2/guides/essentials/security/#defining-profiles"
                >Security Profiles</a
              >
              defined in your Kuzzle server.<br />
              <em
                >Currently, no Profile is defined. You can create one by pushing
                the "Create" button above.</em
              >
            </p>
            <router-link
              :disabled="!canCreateProfile()"
              :class="!canCreateProfile() ? 'disabled' : ''"
              :title="
                !canCreateProfile()
                  ? 'You are not allowed to create new profiles'
                  : ''
              "
              :to="{ name: 'SecurityProfilesCreate' }"
              class="btn primary waves-effect waves-light"
            >
              <i class="fa fa-plus-circle left" />
              Create a profile
            </router-link>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
import CommonList from './CommonList'
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
    CommonList,
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
