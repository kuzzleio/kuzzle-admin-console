<template>
  <div class="UpdateProfile mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <Headline>
      Edit profile - <span class="bold">{{ id }}</span>
    </Headline>
    <Notice />
    <Alert v-if="displayWarningAlert" class="mb-4" variant="warning">
      Warning, you are editing a profile that applies to yourself!
    </Alert>
    <CreateOrUpdate
      v-if="!loading"
      :id="id"
      :profile="document"
      @cancel="onCancel"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import omit from 'lodash/omit';
import { useRouter } from 'vue-router';

import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { Alert } from '@/components/ui/alert';
import { useToast } from '@/composables/useToast';
import { logger } from '@/lib/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';
import type { ProfileSubmission } from './types';

import CreateOrUpdate from './CreateOrUpdate.vue';

const props = defineProps<{
  id: string;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const router = useRouter();
const toast = useToast();

const document = ref('{}');
const submitted = ref(false);
const loading = ref(true);

const displayWarningAlert = computed(
  () => authStore.userProfiles && authStore.userProfiles.includes(props.id),
);

/* Le SDK de la connexion courante. Appelé dans un `try` : son absence y est
   une erreur comme une autre. */
function sdk() {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    throw new Error('No Kuzzle SDK for the current environment');
  }
  return kuzzle;
}

onMounted(async () => {
  loading.value = true;
  try {
    const fetchedProfile = await sdk().security.getProfile(props.id);
    const profile = omit(fetchedProfile, ['_id', '_kuzzle']);
    document.value = JSON.stringify(profile, null, 2);
    loading.value = false;
  } catch (e) {
    logger.error(e);
    toast.warning(
      'Ooops! Something went wrong while loading the profile',
      'The complete error has been printed to console',
    );
  }
});

async function onSubmit({ profile }: ProfileSubmission): Promise<void> {
  if (!profile || !profile.policies) {
    toast.warning(
      'The profile is invalid',
      'Please, ensure you submit an object with at least a <code>policies</code> attribute inside',
    );
    return;
  }

  submitted.value = true;

  try {
    await sdk().security.updateProfile(props.id, profile);
    router.push({ name: 'SecurityProfilesList' });
  } catch (e) {
    logger.error(e);
    toast.warning(
      'Ooops! Something went wrong while updating the profile',
      'The complete error has been printed to console',
    );
    submitted.value = false;
  }
}

/* Voir `Create` : `_prevTransition` n'existe plus en vue-router 4. */
function onCancel(): void {
  router.push({ name: 'SecurityProfilesList' });
}
</script>
