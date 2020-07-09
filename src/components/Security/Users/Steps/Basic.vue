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
          :added-profiles="addedProfiles"
          @selected-profile="onProfileSelected"
          @remove-profile="removeProfile"
        />
        <b-row>
          <b-col offset="6">
            <div class="text-danger">
              <small v-if="validations.$anyError"
                >Please add at least one profile</small
              >
              <small v-else><br /></small>
            </div>
          </b-col>
        </b-row>
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
    kuid: {
      type: String,
      default: null
    },
    editKuid: {
      type: Boolean,
      default: false
    },
    validations: {
      type: Object
    }
  },
  methods: {
    setCustomKuid(value) {
      this.$emit('set-custom-kuid', value)
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
