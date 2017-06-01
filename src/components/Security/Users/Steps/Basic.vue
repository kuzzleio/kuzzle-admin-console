<template>
  <form class="wrapper" @submit.prevent="next">
    <div class="row">
      <div class="col s3">
        <strong>KUID</strong>
      </div>

      <div class="col s9">
        <input
          type="checkbox"
          class="filled-in"
          tabindex="2"
          id="user-auto-generate-kuid"
          :checked="autoGenerateKUID"
          @change="setAutoGenerateKUID"
          />
        <label for="user-auto-generate-kuid">
          Auto-generate
        </label>
        <input v-if="!autoGenerateKUID" placeholder="Custom KUID" id="custom-kuid" type="text" class="validate" required>
      </div>
    </div class="row">
    <div class="row">
      <div class="col s3">
        <strong>Profiles</strong>
      </div>
      <div class="col s9">
        <user-profile-list
          :added-profiles="addedProfiles"
          @selected-profile="onProfileSelected"
        ></user-profile-list>
      </div>
    </div>
  </form>
</template>

<script type="text/javascript">
import UserProfileList from './UserProfileList'

export default {
  name: 'UserBasicData',
  components: {
    UserProfileList
  },
  data () {
    return {
      autoGenerateKUID: true,
      addedProfiles: []
    }
  },
  methods: {
    setAutoGenerateKUID (event) {
      this.autoGenerateKUID = event.target.checked
    },
    onProfileSelected (profile) {
      this.addedProfiles.push(profile)
    }
  }
}
</script>
