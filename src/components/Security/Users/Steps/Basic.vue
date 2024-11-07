<template>
  <form class="wrapper">
    <b-form-group label-cols="2" data-cy="UserBasic-kuid" :invalid-feedback="kuidFeedback">
      <template #label><strong>KUID</strong></template>
      <b-input
        id="custom-kuid"
        class="validate"
        placeholder="You can leave this field empty to let Kuzzle auto-generate the KUID"
        type="text"
        :disabled="!editKuid"
        :state="validateState('kuid')"
        :value="kuid"
        @input="setCustomKuid"
      />
    </b-form-group>
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
            <div class="text-danger" data-cy="UserProfileList-invalidFeedback">
              <small v-if="validations.addedProfiles.$error">Please add at least one profile</small>
              <small v-else><br /></small>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </form>
</template>

<script type="text/javascript">
import UserProfileList from './UserProfileList.vue';

export default {
  name: 'UserBasicData',
  components: {
    UserProfileList,
  },
  props: {
    addedProfiles: {
      type: Array,
      default: () => {
        return [];
      },
    },
    kuid: {
      type: String,
      default: null,
    },
    editKuid: {
      type: Boolean,
      default: false,
    },
    validations: {
      type: Object,
    },
  },
  computed: {
    kuidFeedback() {
      if (this.validations.kuid.$errors.length > 0) {
        return this.validations.kuid.$errors[0].$message;
      }

      return null;
    },
  },
  methods: {
    validateState(fieldName) {
      const { $dirty, $error } = this.validations[fieldName];
      return $dirty ? !$error : null;
    },
    setCustomKuid(value) {
      this.$emit('set-custom-kuid', value);
    },
    onProfileSelected(profile) {
      this.$emit('profile-add', profile);
    },
    removeProfile(profile) {
      this.$emit('profile-remove', profile);
    },
  },
};
</script>
