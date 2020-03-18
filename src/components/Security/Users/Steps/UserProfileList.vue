<template>
  <div>
    <b-badge
      v-for="(profile, index) in addedProfiles"
      :key="index"
      class="chip"
      title="Click to remove"
    >
      {{ profile }}&nbsp;
      <i class="fa fa-trash" @click="removeProfile(profile)" />
    </b-badge>
    <div v-if="profileList.length" class="mt-2">
      <b-form-select v-model="selectedProfiled" @change="onProfileSelected">
        <b-select-option
          v-if="availableProfiles.length"
          disabled
          selected
          :value="0"
        >
          Select a Profile to add
        </b-select-option>
        <b-select-option
          v-if="profileList.length && availableProfiles.length === 0"
          value="The user has all the profiles (are you sure?)"
          disabled
        />
        <b-select-option
          v-for="profile of availableProfiles"
          :key="profile.id"
          :value="profile"
        >
          {{ profile }}
        </b-select-option>
      </b-form-select>
    </div>
    <div v-else>
      No profiles found (you should
      <router-link
        :to="{ name: 'SecurityProfilesCreate' }"
        class="text-light-blue"
      >
        create one
      </router-link>
      before creating a user)
    </div>
  </div>
</template>

<script type="text/javascript">
import { performSearchProfiles } from '../../../../services/kuzzleWrapper'

export default {
  name: 'UserProfileList',
  components: {},
  props: {
    addedProfiles: {
      type: Array
    }
  },
  data() {
    return {
      profileList: [],
      selectedProfiled: 0
    }
  },
  computed: {
    availableProfiles() {
      return this.profileList
        .filter(profile => {
          return this.addedProfiles.indexOf(profile.id) === -1
        })
        .map(profile => profile.id)
    }
  },
  mounted() {
    return this.fetchProfileList()
  },
  methods: {
    fetchProfileList() {
      return performSearchProfiles().then(result => {
        result.documents.forEach(profile => {
          this.profileList.push(profile)
        })
      })
    },
    onProfileSelected(profile) {
      this.$emit('selected-profile', profile)
      this.selectedProfiled = 0
    },
    removeProfile(profile) {
      this.$emit('remove-profile', profile)
    }
  }
}
</script>

<style type="text/css" scoped>
.chip {
  margin-right: 5px;
  cursor: pointer;
}
</style>
