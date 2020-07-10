<template>
  <form class="wrapper">
    <b-row>
      <b-col cols="2">
        <strong>KUID</strong>
      </b-col>

      <b-col>
        <b-input
          v-if="editKuid"
          class="validate"
          data-cy="UserBasic-kuid"
          id="custom-kuid"
          placeholder="You can leave this field empty to let Kuzzle auto-generate the KUID"
          type="text"
          :value="kuid"
          :disabled="autoGenerateKuid"
          @change="setCustomKuid"
        />
        <span class="code" v-if="!editKuid">{{ kuid }}</span>
      </b-col>
    </b-row>
    <b-row class="mt-2">
      <b-col cols="2">
        <strong>Profiles</strong>
      </b-col>
      <b-col cols="10">
        <user-profile-list
          ref="profileList"
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
  data() {
    return {
      autoGenerateKuidValue: false,
      profilesValid: null
    }
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
    validate() {
      return this.$refs.profileList.validate()
    },
    setCustomKuid(value) {
      this.$emit('set-custom-kuid', value)
    },
    onProfileSelected(profile) {
      this.$emit('profile-add', profile)
    },
    removeProfile(profile) {
      this.$emit('profile-remove', profile)
    }
  },
  watch: {
    autoGenerateKuid: {
      immediate: true,
      handler(v) {
        this.autoGenerateKuidValue = v
      }
    }
  }
}
</script>
