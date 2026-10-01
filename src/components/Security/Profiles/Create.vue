<template>
  <div class="CreateProfile mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <Headline> Create a new profile </Headline>
    <Notice />
    <CreateOrUpdate @cancel="onCancel" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { useKuzzleStore } from '@/stores';
import type { ProfileSubmission } from './types';

import CreateOrUpdate from './CreateOrUpdate.vue';

const kuzzleStore = useKuzzleStore();
const router = useRouter();
const toast = useToast();

async function onSubmit({ profile, id }: ProfileSubmission): Promise<void> {
  if (!profile || !profile.policies) {
    toast.warning(
      'The profile is invalid',
      'Please, ensure you submit an object with at least a <code>policies</code> attribute inside',
    );
    return;
  }
  try {
    const kuzzle = kuzzleStore.$kuzzle;
    if (!kuzzle) {
      throw new Error('No Kuzzle SDK for the current environment');
    }
    await kuzzle.security.createProfile(id, profile);
    router.push({ name: 'SecurityProfilesList' });
  } catch (e) {
    logger.error(e);
    toast.warning('Ooops! Something went wrong while creating the profile', caught(e).message);
  }
}

/* Le retour à la page précédente lisait `$router._prevTransition`, un
   interne de vue-router 3 qui n'existe plus : l'annulation menait déjà
   toujours à la liste. */
function onCancel(): void {
  router.push({ name: 'SecurityProfilesList' });
}
</script>
