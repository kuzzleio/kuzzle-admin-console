<template>
  <b-row class="UserProfileList">
    <b-col cols="6"
      ><div v-if="profileList.length">
        <b-form-select
          v-model="selectedProfiled"
          @change="onProfileSelected"
          data-cy="UserProfileList-select"
        >
          <b-select-option v-if="availableProfiles.length" :value="0">
            Select a Profile to add
          </b-select-option>
          <b-select-option
            v-if="profileList.length && availableProfiles.length === 0"
            :value="null"
            disabled
            >The user has all the profiles (are you sure?)
          </b-select-option>
          <b-select-option
            v-for="profile of availableProfiles"
            :key="profile._id"
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
      </div></b-col
    >
    <b-col cols="6" class="UserProfileList-badges vertical-align">
      <template v-if="addedProfiles.length">
        <b-badge
          v-for="(profile, index) in addedProfiles"
          class="p-2 mr-2 my-1"
          title="Click to remove"
          :data-cy="`UserProfileList-badge--${profile}`"
          :key="index"
        >
          {{ profile }}&nbsp;
          <i
            class="UserProfileList-delete ml-1 fa fa-trash"
            :data-cy="`UserProfileList-${profile}--delete`"
            @click="removeProfile(profile)"
          />
        </b-badge>
      </template>
      <template v-else>
        <span class="text-secondary">No profiles selected</span>
      </template>
    </b-col>
  </b-row>
</template>

<script type="text/javascript">
import { mapGetters } from 'vuex'

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
    ...mapGetters('kuzzle', ['wrapper']),
    availableProfiles() {
      return this.profileList
        .filter(profile => {
          return !this.addedProfiles.includes(profile._id)
        })
        .map(profile => profile._id)
        .sort()
    }
  },
  mounted() {
    return this.fetchProfileList()
  },
  methods: {
    fetchProfileList() {
      return this.wrapper.performSearchProfiles().then(result => {
        result.documents.forEach(profile => {
          this.profileList.push(profile)
        })
      })
    },
    onProfileSelected(profile) {
      if (!profile) {
        return
      }
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
.UserProfileList-delete {
  cursor: pointer;
}
.UserProfileList-badges {
  flex-wrap: wrap;
}
</style>
