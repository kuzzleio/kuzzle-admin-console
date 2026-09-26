<template>
  <div class="h-screen overflow-auto">
    <form class="flex min-h-full justify-center px-4 py-6" @submit.prevent="submit">
      <Card class="my-auto w-full max-w-3xl">
        <CardHeader class="gap-4">
          <img
            alt="Welcome to the Kuzzle Admin Console"
            class="h-15 w-auto self-start"
            height="60"
            src="../../../assets/logo.svg"
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

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

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

export default defineComponent({
  name: 'CreateEnvironmentPage',
  components: {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    CreateEnvironment,
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['hasEnvironment', 'environments']),
    // `id` n'est pas déclaré en prop : le déclarer le retirerait de `$attrs`,
    // donc de l'attribut `id` posé sur le nœud racine.
    environmentId(): string | undefined {
      return this.$attrs.id as string | undefined;
    },
  },
  methods: {
    async submit() {
      const id = await (
        this.$refs.createEnvironmentComponent as {
          submit: () => Promise<string | undefined>;
        }
      ).submit();
      if (id === undefined) {
        return;
      }

      if (Object.keys(this.environments).length > 1) {
        this.$router.push({ name: 'SelectEnvironment' });
      } else {
        await this.kuzzleStore.setCurrentEnvironment(id);
        this.$router.push('/');
      }
    },
    importEnv() {
      this.$emit('environment::importEnv');
    },
  },
});
</script>
