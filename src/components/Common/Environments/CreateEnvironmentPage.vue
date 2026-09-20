<template>
  <div class="tw:h-screen tw:overflow-auto">
    <form class="tw:flex tw:min-h-full tw:justify-center tw:px-4 tw:py-6" @submit.prevent="submit">
      <Card class="tw:my-auto tw:w-full tw:max-w-3xl">
        <CardHeader class="tw:gap-4">
          <img
            alt="Welcome to the Kuzzle Admin Console"
            class="tw:h-15 tw:w-auto tw:self-start"
            height="60"
            src="../../../assets/logo.svg"
          />
          <CardTitle class="tw:text-3xl">
            {{ $attrs.id ? 'Edit a Connection' : 'Create a Connection' }}
          </CardTitle>
          <CardDescription class="tw:text-base">
            Please provide the details below to connect to your Kuzzle instance.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <create-environment
            ref="createEnvironmentComponent"
            :environment-id="$attrs.id"
            @environment::importEnv="importEnv"
          />
        </CardContent>

        <CardFooter class="tw:flex-wrap tw:justify-end tw:gap-3">
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
  },
  methods: {
    async submit() {
      const id = await (
        this.$refs.createEnvironmentComponent as unknown as {
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
