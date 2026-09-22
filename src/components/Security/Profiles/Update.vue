<template>
  <div class="UpdateProfile mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <Headline>
      Edit profile - <span class="bold">{{ id }}</span>
    </Headline>
    <Notice />
    <Alert v-if="displayWarningAlert" class="mb-4" variant="warning">
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
      this.$toast.warning(
        'Ooops! Something went wrong while loading the profile',
        'The complete error has been printed to console',
      );
    }
  },
  methods: {
    async onSubmit({ profile }) {
      if (!profile || !profile.policies) {
        this.$toast.warning(
          'The profile is invalid',
          'Please, ensure you submit an object with at least a <code>policies</code> attribute inside',
        );
        return;
      }

      this.submitted = true;

      try {
        await this.$kuzzle.security.updateProfile(this.id, profile);
        this.$router.push({ name: 'SecurityProfilesList' });
      } catch (e) {
        this.$log.error(e);
        this.$toast.warning(
          'Ooops! Something went wrong while updating the profile',
          'The complete error has been printed to console',
        );
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
