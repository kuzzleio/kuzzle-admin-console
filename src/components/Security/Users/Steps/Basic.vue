<template>
  <form class="wrapper">
    <b-row>
      <b-col cols="2">
        <strong>KUID</strong>
      </b-col>

      <b-col cols="6">
        <input
          v-if="editKuid"
          id="custom-kuid"
          type="text"
          class="validate"
          placeholder="Custom KUID"
          :value="kuid"
          :disabled="autoGenerateKuid"
          @change="setCustomKuid"
        />
        <span class="code" v-if="!editKuid">{{ kuid }}</span>
      </b-col>
      <b-col cols="3" v-if="editKuid">
        <label>
          <input
            id="user-auto-generate-kuid"
            type="checkbox"
            class="filled-in"
            :checked="autoGenerateKuid"
            @change="setAutoGenerateKuid"
          />
          <span>
            Auto-generate
          </span>
        </label>
      </b-col>
    </b-row>
    <b-row class="mt-2">
      <b-col cols="2">
        <strong>Profiles</strong>
      </b-col>
      <b-col cols="10">
        <user-profile-list
          :added-profiles="addedProfiles"
          @selected-profile="onProfileSelected"
          @remove-profile="removeProfile"
        />
      </b-col>
    </b-row>
  </form>
</template>

<script type="text/javascript">
import UserProfileList from './UserProfileList'

export default {
  name: 'UserBasicData',
  components: {
    UserProfileList
  },
  props: {
    addedProfiles: {
      type: Array,
      default: () => {
        return []
      }
    },
    autoGenerateKuid: {
      type: Boolean,
      default: false
    },
    kuid: {
      type: String,
      default: null
    },
    editKuid: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    setAutoGenerateKuid(event) {
      this.$emit('set-auto-generate-kuid', event.target.checked)
    },
    setCustomKuid(event) {
      this.$emit('set-custom-kuid', event.target.value)
    },
    onProfileSelected(profile) {
      this.$emit('profile-add', profile)
    },
    removeProfile(profile) {
      this.$emit('profile-remove', profile)
    }
  }
}
</script>
