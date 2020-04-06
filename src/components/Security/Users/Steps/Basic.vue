<template>
  <form class="wrapper">
    <b-row>
      <b-col cols="2">
        <strong>KUID</strong>
      </b-col>

      <b-col cols="5">
        <b-input
          v-if="editKuid"
          class="validate"
          data-cy="UserBasic-kuid"
          id="custom-kuid"
          type="text"
          :placeholder="
            autoGenerateKuidValue
              ? 'Will be auto-generated'
              : 'Please fill-in the KUID'
          "
          :value="kuid"
          :disabled="autoGenerateKuid"
          @change="setCustomKuid"
        />
        <span class="code" v-if="!editKuid">{{ kuid }}</span>
      </b-col>
      <b-col cols="3" v-if="editKuid" class="vertical-align">
        <b-form-checkbox
          v-model="autoGenerateKuidValue"
          class="filled-in"
          data-cy="UserBasic-autoKuidBtn"
          id="user-auto-generate-kuid"
          type="checkbox"
          @input="$emit('set-auto-generate-kuid', $event)"
        >
          <span>
            Auto-generate
          </span>
        </b-form-checkbox>
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
  data() {
    return {
      autoGenerateKuidValue: false
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
