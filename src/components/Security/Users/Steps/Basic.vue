<template>
  <form class="wrapper flex flex-col gap-4">
    <FormItem data-cy="UserBasic-kuid">
      <Label for="custom-kuid"><strong>KUID</strong></Label>
      <Input
        id="custom-kuid"
        :aria-invalid="kuidFeedback ? 'true' : undefined"
        :disabled="!editKuid"
        placeholder="You can leave this field empty to let Kuzzle auto-generate the KUID"
        :model-value="kuid"
        type="text"
        @update:modelValue="setCustomKuid"
      />
      <FormMessage v-if="kuidFeedback">{{ kuidFeedback }}</FormMessage>
    </FormItem>

    <FormItem>
      <Label><strong>Profiles</strong></Label>
      <user-profile-list
        :added-profiles="addedProfiles"
        @remove-profile="removeProfile"
        @selected-profile="onProfileSelected"
      />
      <div data-cy="UserProfileList-invalidFeedback">
        <FormMessage v-if="validations.addedProfiles.$error">
          Please add at least one profile
        </FormMessage>
      </div>
    </FormItem>
  </form>
</template>

<script type="text/javascript">
import { FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import UserProfileList from './UserProfileList.vue';

export default {
  name: 'UserBasicData',
  components: {
    FormItem,
    FormMessage,
    Input,
    Label,
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
