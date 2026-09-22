<template>
  <div class="CreateProfile mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <Headline> Create a new profile </Headline>
    <Notice />
    <create-or-update @cancel="onCancel" @submit="onSubmit" />
  </div>
</template>

<script>
import { mapState } from 'pinia';

import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { useKuzzleStore } from '@/stores';

import CreateOrUpdate from './CreateOrUpdate.vue';

export default {
  name: 'CreateProfile',
  components: {
    Headline,
    CreateOrUpdate,
    Notice,
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
  },
  methods: {
    async onSubmit({ profile, id }) {
      if (!profile || !profile.policies) {
        this.$toast.warning(
          'The profile is invalid',
          'Please, ensure you submit an object with at least a <code>policies</code> attribute inside',
        );
        return;
      }
      try {
        await this.$kuzzle.security.createProfile(id, profile);
        this.$router.push({ name: 'SecurityProfilesList' });
      } catch (e) {
        this.$log.error(e);
        this.$toast.warning('Ooops! Something went wrong while creating the profile', e.message);
      }
    },
    onCancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.go(this.$router._prevTransition.to);
      } else {
        this.$router.push({ name: 'SecurityProfilesList' });
      }
    },
    setError(payload) {
      this.error = payload;
    },
  },
};
</script>
