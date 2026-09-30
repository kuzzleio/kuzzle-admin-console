<template>
  <div class="UserUpdate mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="UserUpdate--container">
      <Headline v-if="!!id">
        Edit user - <span class="code">{{ route.params.id }}</span>
      </Headline>
      <Headline v-else> Create a new user </Headline>

      <Notice />

      <Card class="shadow-signature">
        <CardContent>
          <MainSpinner v-if="loading" class="my-8" />

          <Tabs v-else v-model="activeTab">
            <TabsList>
              <TabsTrigger data-cy="UserUpdate-basicTab" value="basic">
                <i
                  v-if="basicTabHasErrors"
                  class="fas fa-exclamation-circle text-destructive"
                  data-cy="UserUpdate-basicTab--dangerIcon"
                />
                Basic
              </TabsTrigger>
              <TabsTrigger data-cy="UserUpdate-customTab" value="custom">
                <i
                  v-if="v$.customContentValue.$errors.length > 0"
                  class="fas fa-exclamation-circle text-destructive"
                  data-cy="UserUpdate-customTab--dangerIcon"
                />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent class="pt-4" value="basic">
              <Basic
                :edit-kuid="!id"
                :added-profiles="form.addedProfiles"
                :kuid="form.kuid"
                :validations="v$"
                @set-custom-kuid="setCustomKuid"
                @profile-add="onProfileAdded"
                @profile-remove="onProfileRemoved"
              />
              <CredentialsSelector
                class="mt-4"
                :credentials="credentials"
                :strategies="strategies"
                :credentials-mapping="credentialsMapping"
                @input="onCredentialsChanged"
              />
            </TabsContent>

            <TabsContent class="pt-4" value="custom">
              <CustomData
                :mapping="customContentMapping"
                :value="customContent"
                @input="onCustomContentChanged"
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter class="justify-end gap-2">
          <Button tabindex="6" variant="outline" @click.prevent="cancel">Cancel</Button>
          <Button
            data-cy="UserUpdate-submit"
            :disabled="submitting"
            type="submit"
            @click.prevent="submit"
          >
            <span v-if="id">Save</span>
            <span v-else>Create</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { helpers, not } from '@vuelidate/validators';
import { useRoute, useRouter } from 'vue-router';

import MainSpinner from '../../Common/MainSpinner.vue';
import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/plugins/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { isWhitespace, startsWithSpace } from '@/validators';
import type { Credentials } from './types';

import Basic from './Steps/Basic.vue';
import CredentialsSelector from './Steps/CredentialsSelector.vue';
import CustomData from './Steps/CustomData.vue';

const props = defineProps<{
  id?: string;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const form = reactive<{
  addedProfiles: string[];
  customContentValue: string;
  kuid: string | null;
}>({
  addedProfiles: [],
  customContentValue: '{}',
  kuid: null,
});
const loading = ref(false);
const activeTab = ref('basic');
const submitting = ref(false);
const credentials = ref<Credentials>({});
const strategies = ref<string[]>([]);
const credentialsMapping = ref<Record<string, string[]>>({});
const customContent = ref('{}');
const customContentMapping = ref<Record<string, unknown>>({});

// TODO One day we should be able to validate credentials (big deal)
const rules = computed(() => ({
  kuid: {
    notEmpty: helpers.withMessage('The KUID cannot contain just whitespaces', not(isWhitespace)),
    notStartsWithSpace: helpers.withMessage(
      'The KUID cannot start with a whitespace',
      not(startsWithSpace),
    ),
  },
  addedProfiles: {
    minLength: (value: string[]) => value.length > 0,
  },
  customContentValue: {
    syntaxOK: (value: string) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
  },
}));
const v$ = useVuelidate(rules, form);

/* L'onglet « Basic » regroupe `kuid` et `addedProfiles`. C'était un
   `$validationGroups` de Vuelidate, que ses types ignorent : le groupe se
   réduisait à la réunion de leurs erreurs, et c'est ce qu'on lit. */
const basicTabHasErrors = computed(
  () => v$.value.kuid.$errors.length > 0 || v$.value.addedProfiles.$errors.length > 0,
);

/* Le SDK et le wrapper de la connexion courante. Appelés dans un `try` : leur
   absence y est une erreur comme une autre. */
function sdk() {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    throw new Error('No Kuzzle SDK for the current environment');
  }
  return kuzzle;
}
function wrapper() {
  const kuzzleWrapper = kuzzleStore.wrapper;
  if (!kuzzleWrapper) {
    throw new Error('No Kuzzle wrapper set for the current environment');
  }
  return kuzzleWrapper;
}

onMounted(async () => {
  loading.value = true;

  try {
    const fetchedMapping = await sdk().security.getAllCredentialFields();
    strategies.value = Object.keys(fetchedMapping);

    /* La boucle qui retirait « kuid » de chaque stratégie lisait `.kuid` sur
       un tableau de noms de champs, où il n'existe pas : elle ne retirait
       rien, et n'est plus là. */
    credentialsMapping.value = fetchedMapping;

    const { mapping } = await wrapper().getMappingUsers();
    if (mapping) {
      customContentMapping.value = mapping;
      delete customContentMapping.value.profileIds;
    }

    if (props.id) {
      const kuid = props.id;
      form.kuid = kuid;

      await Promise.all(
        strategies.value.map(async (strategy) => {
          const credentialsExists = await sdk().security.hasCredentials(strategy, kuid);

          if (!credentialsExists) {
            return;
          }

          const strategyCredentials = await sdk().security.getCredentials(strategy, kuid);

          if (strategyCredentials.kuid) {
            delete strategyCredentials.kuid;
          }

          credentials.value[strategy] = strategyCredentials;
        }),
      );

      /*
       * `this.id` était réaffecté ici avec le `_id` renvoyé par le backend —
       * la même valeur que la prop, qui vient du paramètre de route. Vue 2
       * tolérait l'écriture dans une prop avec un avertissement ; en Vue 3
       * les props sont un proxy en lecture seule et l'affectation **lève**
       * (G-045). Le chargement s'interrompait ici, donc sans profils.
       */
      const { content } = await sdk().security.getUser(kuid);
      form.addedProfiles = content.profileIds;
      delete content.profileIds;
      delete content._kuzzle_info;
      customContent.value = JSON.stringify(content, null, 2);
      form.customContentValue = customContent.value;
    }

    loading.value = false;
  } catch (e) {
    logger.error(e);
    toast.warning(
      'Ooops! Something went wrong while loading the user',
      'The complete error has been printed to console',
    );
  }
});

function onProfileAdded(profile: string): void {
  v$.value.addedProfiles.$model.push(profile);
  v$.value.addedProfiles.$touch();
}
function onProfileRemoved(profile: string): void {
  v$.value.addedProfiles.$model.splice(v$.value.addedProfiles.$model.indexOf(profile), 1);
  v$.value.addedProfiles.$touch();
}
function setCustomKuid(value: string | number): void {
  v$.value.kuid.$model = String(value);
}
function onCredentialsChanged(payload: {
  credentials: Record<string, string | number>;
  strategy: string;
}): void {
  credentials.value[payload.strategy] = { ...payload.credentials };
}
function onCustomContentChanged(value: string): void {
  v$.value.customContentValue.$model = value;
}

async function submit(): Promise<void> {
  v$.value.$touch();
  if (v$.value.$errors.length > 0) {
    return;
  }
  for (const strategy of Object.keys(credentials.value)) {
    const strategyCredentials = credentials.value[strategy];
    const notEmptyFields = Object.keys(strategyCredentials).filter(
      (field) => strategyCredentials[field] !== '',
    );
    if (notEmptyFields.length === 0) {
      delete credentials.value[strategy];
    }
  }
  submitting.value = true;
  try {
    if (props.id) {
      await wrapper().performReplaceUser(form.kuid, {
        profileIds: form.addedProfiles,
        ...JSON.parse(form.customContentValue),
      });
      await Promise.all(
        Object.keys(credentials.value).map(async (strategy) => {
          const kuid = String(form.kuid);
          const credentialsExists = await sdk().security.hasCredentials(strategy, kuid);

          if (credentialsExists) {
            await sdk().security.updateCredentials(strategy, kuid, credentials.value[strategy]);
          } else {
            await sdk().security.createCredentials(strategy, kuid, credentials.value[strategy]);
          }
        }),
      );
    } else {
      await wrapper().performCreateUser(form.kuid, {
        content: {
          profileIds: form.addedProfiles,
          ...JSON.parse(form.customContentValue),
        },
        credentials: credentials.value,
      });
      if (!authStore.adminAlreadyExists) {
        try {
          await authStore.checkFirstAdmin();
        } catch (err) {
          logger.error(err);
        }
      }
    }
    router.push({ name: 'SecurityUsersList' });
  } catch (err) {
    logger.error(err);
    submitting.value = false;
    toast.danger('Unable to create user', caught(err).message);
  }
}

/* Le retour à la page précédente lisait `$router._prevTransition`, un
   interne de vue-router 3 qui n'existe plus : l'annulation menait déjà
   toujours à la liste. */
function cancel(): void {
  router.push({ name: 'SecurityUsersList' });
}
</script>
