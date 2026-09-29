<template>
  <div class="h-screen overflow-auto">
    <form class="flex min-h-full justify-center px-4 py-6" @submit.prevent="submit">
      <Card class="my-auto w-full max-w-3xl shadow-signature">
        <CardHeader class="gap-4">
          <KuzzleLogo
            alt="Welcome to the Kuzzle Admin Console"
            class="h-15 w-auto self-start"
            height="60"
          />
          <CardTitle class="font-display text-display font-bold uppercase">
            {{ $attrs.id ? 'Edit a Connection' : 'Create a Connection' }}
          </CardTitle>
          <CardDescription class="text-base">
            Please provide the details below to connect to your Kuzzle instance.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <create-environment
            ref="createEnvironmentComponent"
            :environment-id="environmentId"
            @environment::importEnv="importEnv"
          />
        </CardContent>

        <CardFooter class="flex-wrap justify-end gap-3">
          <Button
            v-if="hasEnvironment"
            variant="outline"
            type="button"
            @click="$router.push({ name: 'SelectEnvironment' })"
          >
            Cancel
          </Button>
          <Button
            class="CreateEnvironment-import"
            data-cy="CreateEnvironment-import"
            variant="outline"
            type="button"
            @click="importEnv"
          >
            Import connections
          </Button>
          <Button data-cy="Environment-SubmitButton" type="submit">
            {{ $attrs.id ? 'Save' : 'Create' }} connection
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import KuzzleLogo from '../KuzzleLogo.vue';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useKuzzleStore } from '@/stores';

import CreateEnvironment from './CreateEnvironment.vue';

const emit = defineEmits<{
  (e: 'environment::importEnv'): void;
}>();

const attrs = useAttrs();
const kuzzleStore = useKuzzleStore();
const router = useRouter();

const createEnvironmentComponent = useTemplateRef<InstanceType<typeof CreateEnvironment>>(
  'createEnvironmentComponent',
);

const hasEnvironment = computed(() => kuzzleStore.hasEnvironment);
// `id` n'est pas déclaré en prop : le déclarer le retirerait de `$attrs`,
// donc de l'attribut `id` posé sur le nœud racine.
const environmentId = computed((): string | undefined =>
  typeof attrs.id === 'string' ? attrs.id : undefined,
);

async function submit(): Promise<void> {
  const id = await createEnvironmentComponent.value?.submit();
  if (id === undefined) {
    return;
  }

  if (Object.keys(kuzzleStore.environments).length > 1) {
    router.push({ name: 'SelectEnvironment' });
  } else {
    await kuzzleStore.setCurrentEnvironment(id);
    router.push('/');
  }
}

function importEnv(): void {
  emit('environment::importEnv');
}
</script>
