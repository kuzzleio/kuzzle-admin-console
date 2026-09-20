<template>
  <div
    class="UpdateProfile tw:mx-auto tw:flex tw:h-full tw:w-full tw:max-w-6xl tw:flex-col tw:px-4"
  >
    <Headline>
      Edit profile - <span class="bold">{{ id }}</span>
    </Headline>
    <Notice />
    <Alert v-if="displayWarningAlert" class="tw:mb-4" variant="warning">
      Warning, you are editing a profile that applies to yourself!
    </Alert>
    <create-or-update
      v-if="!loading"
      :id="id"
      :profile="document"
      @cancel="onCancel"
      @submit="onSubmit"
    />
  </div>
</template>

<script>
import omit from 'lodash/omit';
import { mapState } from 'pinia';

import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { Alert } from '@/components/ui/alert';
import { useAuthStore, useKuzzleStore } from '@/stores';

import CreateOrUpdate from './CreateOrUpdate.vue';

export default {
  name: 'UpdateProfile',
  components: {
    Alert,
    Headline,
    CreateOrUpdate,
    Notice,
  },
  props: {
    id: {
      type: String,
      require: true,
    },
  },
  data() {
    return {
      document: '{}',
      submitted: false,
      loading: true,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
    ...mapState(useAuthStore, ['userProfiles']),
    displayWarningAlert() {
      return this.userProfiles && this.userProfiles.includes(this.id);
    },
  },
  async mounted() {
    this.loading = true;
    try {
      const fetchedProfile = await this.$kuzzle.security.getProfile(this.id);
      const profile = omit(fetchedProfile, ['_id', '_kuzzle']);
      this.document = JSON.stringify(profile, null, 2);
      this.loading = false;
    } catch (e) {
      this.$log.error(e);
      this.$bvToast.toast('The complete error has been printed to console', {
        title: 'Ooops! Something went wrong while loading the profile',
        variant: 'warning',
        toaster: 'b-toaster-bottom-right',
        appendToast: true,
        dismissible: true,
        noAutoHide: true,
      });
    }
  },
  methods: {
    async onSubmit({ profile }) {
      if (!profile || !profile.policies) {
        this.$bvToast.toast(
          'Please, ensure you submit an object with at least a <code>policies</code> attribute inside',
          {
            title: 'The profile is invalid',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true,
          },
        );
        return;
      }

      this.submitted = true;

      try {
        await this.$kuzzle.security.updateProfile(this.id, profile);
        this.$router.push({ name: 'SecurityProfilesList' });
      } catch (e) {
        this.$log.error(e);
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while updating the profile',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
        this.submitted = false;
      }
    },
    onCancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.go(this.$router._prevTransition.to);
      } else {
        this.$router.push({ name: 'SecurityProfilesList' });
      }
    },
  },
};
</script>
